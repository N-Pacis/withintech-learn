import { prisma } from "../../db/prisma";
import { badRequest, notFound, forbidden } from "../../utils/errors";
import { upsertCertificate } from "./certificates.service";
import { recalculateUserScore } from "../../utils/scoring";

export interface SubmittedAnswer {
  questionId: string;
  chosenOptionIds: string[];
}

export const submitQuiz = async (
  userId: string,
  quizId: string,
  answers: SubmittedAnswer[],
) => {
  // Load quiz with questions and options in one query
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!quiz) throw notFound("Quiz not found");

  // Verify enrollment if it's a course or module quiz
  if (quiz.courseId) {
    const enrollment = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: { studentId: userId, courseId: quiz.courseId },
      },
    });
    if (!enrollment)
      throw forbidden("You must be enrolled to attempt this quiz");
  } else if (quiz.moduleId) {
    const mod = await prisma.module.findUnique({
      where: { id: quiz.moduleId },
      select: { courseId: true },
    });
    if (!mod) throw notFound("Module not found");
    const enrollment = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: { studentId: userId, courseId: mod.courseId },
      },
    });
    if (!enrollment)
      throw forbidden("You must be enrolled to attempt this quiz");
  } else if (quiz.lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: quiz.lessonId },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw notFound("Lesson not found");
    const enrollment = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: lesson.module.courseId,
        },
      },
    });
    if (!enrollment)
      throw forbidden("You must be enrolled to attempt this quiz");
  }

  if (answers.length !== quiz.questions.length) {
    throw badRequest(
      `Expected ${quiz.questions.length} answers, got ${answers.length}`,
    );
  }

  // Build lookup maps
  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));
  const answerMap = new Map(
    answers.map((a) => [a.questionId, a.chosenOptionIds]),
  );

  // Mark each question
  let correctCount = 0;

  const markedQuestions = quiz.questions.map((question) => {
    const chosenIds = answerMap.get(question.id) ?? [];
    const correctIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    // A question is correct only if chosen set exactly matches correct set.
    // If the question has no correct options configured, award the mark automatically.
    const chosenSet = new Set(chosenIds);
    const correctSet = new Set(correctIds);
    const isCorrect =
      correctSet.size === 0 ||
      (chosenSet.size === correctSet.size &&
        [...chosenSet].every((id) => correctSet.has(id)));

    if (isCorrect) correctCount++;

    const isCourseQuiz = !!quiz.courseId;

    return {
      questionId: question.id,
      text: question.text,
      isCorrect,
      options: question.options.map((o) => {
        const wasChosen = chosenSet.has(o.id);
        return {
          id: o.id,
          text: o.text,
          // For course quizzes, only reveal isCorrect on options the student chose
          ...(isCourseQuiz
            ? wasChosen
              ? { isCorrect: o.isCorrect }
              : {}
            : { isCorrect: o.isCorrect }),
          wasChosen,
        };
      }),
    };
  });

  // Validate all submitted questionIds belong to this quiz
  for (const answer of answers) {
    if (!questionMap.has(answer.questionId)) {
      throw badRequest(
        `Question ${answer.questionId} does not belong to this quiz`,
      );
    }
  }

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const status = score >= quiz.passingScore ? "pass" : "fail";

  const attempt = await prisma.quizAttempt.create({
    data: { userId, quizId, score, status },
    select: {
      id: true,
      score: true,
      status: true,
      quizId: true,
      createdAt: true,
    },
  });

  // Auto-complete course when a course quiz is passed
  if (quiz.courseId && status === "pass") {
    await Promise.all([
      prisma.studentCourse.update({
        where: {
          studentId_courseId: { studentId: userId, courseId: quiz.courseId },
        },
        data: { status: "PASSED" },
      }),
      upsertCertificate(userId, quiz.courseId),
    ]);
  }

  await recalculateUserScore(userId);

  return {
    attempt: {
      ...attempt,
      lessonId: quiz.lessonId ?? null,
      moduleId: quiz.moduleId ?? null,
      courseId: quiz.courseId ?? null,
    },
    questions: markedQuestions,
  };
};
