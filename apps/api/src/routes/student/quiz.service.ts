import { prisma } from '../../db/prisma';
import { badRequest, notFound, forbidden } from '../../utils/errors';

export interface SubmittedAnswer {
  questionId: string;
  chosenOptionIds: string[];
}

export const submitQuiz = async (userId: string, quizId: string, answers: SubmittedAnswer[]) => {
  // Load quiz with questions and options in one query
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  });
  if (!quiz) throw notFound('Quiz not found');

  // Verify enrollment if it's a course or module quiz
  if (quiz.courseId) {
    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId: quiz.courseId } },
    });
    if (!enrollment) throw forbidden('You must be enrolled to attempt this quiz');
  } else if (quiz.moduleId) {
    const mod = await prisma.module.findUnique({ where: { id: quiz.moduleId }, select: { courseId: true } });
    if (!mod) throw notFound('Module not found');
    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId: mod.courseId } },
    });
    if (!enrollment) throw forbidden('You must be enrolled to attempt this quiz');
  }

  if (answers.length !== quiz.questions.length) {
    throw badRequest(`Expected ${quiz.questions.length} answers, got ${answers.length}`);
  }

  // Build lookup maps
  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));
  const answerMap = new Map(answers.map((a) => [a.questionId, a.chosenOptionIds]));

  // Mark each question
  let correctCount = 0;

  const markedQuestions = quiz.questions.map((question) => {
    const chosenIds = answerMap.get(question.id) ?? [];
    const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);

    // A question is correct only if chosen set exactly matches correct set
    const chosenSet = new Set(chosenIds);
    const correctSet = new Set(correctIds);
    const isCorrect =
      chosenSet.size === correctSet.size && [...chosenSet].every((id) => correctSet.has(id));

    if (isCorrect) correctCount++;

    const isCourseQuiz = !!quiz.courseId;

    return {
      questionId: question.id,
      text: question.text,
      isCorrect,
      options: question.options.map((o) => ({
        id: o.id,
        text: o.text,
        ...(isCourseQuiz ? {} : { isCorrect: o.isCorrect }),
        wasChosen: chosenSet.has(o.id),
      })),
    };
  });

  // Validate all submitted questionIds belong to this quiz
  for (const answer of answers) {
    if (!questionMap.has(answer.questionId)) {
      throw badRequest(`Question ${answer.questionId} does not belong to this quiz`);
    }
  }

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const status = score >= quiz.passingScore ? 'pass' : 'fail';

  const attempt = await prisma.quizAttempt.create({
    data: { userId, quizId, score, status },
    select: { id: true, score: true, status: true, quizId: true, createdAt: true },
  });

  return {
    attempt: {
      ...attempt,
      moduleId: quiz.moduleId ?? null,
      courseId: quiz.courseId ?? null,
    },
    questions: markedQuestions,
  };
};
