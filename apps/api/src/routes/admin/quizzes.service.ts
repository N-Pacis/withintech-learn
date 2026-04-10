import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../utils/errors";

const validateReorder = (items: { id: string; orderIndex: number }[]) => {
  const indices = items.map((i) => i.orderIndex).sort((a, b) => a - b);
  if (
    indices[0] !== 1 ||
    indices.some((v, i) => i > 0 && v !== indices[i - 1] + 1)
  )
    throw badRequest("orderIndex values must be contiguous starting from 1");
};

const assertQuizQuestionsHaveCorrectOptions = async (quizId: string) => {
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      options: {
        select: {
          id: true,
          isCorrect: true,
        },
      },
    },
  });

  const hasInvalidQuestion = questions.some(
    (question) =>
      question.options.length > 0 &&
      !question.options.some((option) => option.isCorrect),
  );

  if (hasInvalidQuestion) {
    throw badRequest(
      "Each question with options must have at least one correct option before saving the quiz",
    );
  }
};

export const getModuleQuiz = async (moduleId: string) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw notFound("Module not found");
  return prisma.quiz.findUnique({
    where: { moduleId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
};

export const createModuleQuiz = async (
  moduleId: string,
  data: { title: string; passingScore: number; maxAttempts: number },
) => {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { quiz: true },
  });
  if (!mod) throw notFound("Module not found");
  if (mod.quiz) throw badRequest("Module already has a quiz");
  return prisma.quiz.create({ data: { moduleId, ...data } });
};

export const getLessonQuiz = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw notFound("Lesson not found");
  return prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
};

export const createLessonQuiz = async (
  lessonId: string,
  data: { title: string; passingScore: number; maxAttempts: number },
) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { quiz: true },
  });
  if (!lesson) throw notFound("Lesson not found");
  if (lesson.quiz) throw badRequest("Lesson already has a quiz");
  return prisma.quiz.create({ data: { lessonId, ...data } });
};

export const getCourseQuiz = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound("Course not found");
  return prisma.quiz.findUnique({
    where: { courseId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
};

export const createCourseQuiz = async (
  courseId: string,
  data: { title: string; passingScore: number; maxAttempts: number },
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { quiz: true },
  });
  if (!course) throw notFound("Course not found");
  if (course.quiz) throw badRequest("Course already has a quiz");
  return prisma.quiz.create({ data: { courseId, ...data } });
};

export const getQuiz = async (id: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!quiz) throw notFound("Quiz not found");
  return quiz;
};

export const updateQuiz = async (
  id: string,
  data: { title?: string; passingScore?: number; maxAttempts?: number },
) => {
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) throw notFound("Quiz not found");

  await assertQuizQuestionsHaveCorrectOptions(id);

  return prisma.quiz.update({ where: { id }, data });
};

export const deleteQuiz = async (id: string) => {
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) throw notFound("Quiz not found");
  await prisma.quiz.delete({ where: { id } });
};

export const addQuestion = async (quizId: string, data: { text: string }) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw notFound("Quiz not found");
  const agg = await prisma.question.aggregate({
    where: { quizId },
    _max: { orderIndex: true },
  });
  const orderIndex = (agg._max.orderIndex ?? 0) + 1;
  return prisma.question.create({
    data: { quizId, text: data.text, orderIndex },
  });
};

export const updateQuestion = async (id: string, text: string) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw notFound("Question not found");
  return prisma.question.update({ where: { id }, data: { text } });
};

export const deleteQuestion = async (id: string) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw notFound("Question not found");
  await prisma.question.delete({ where: { id } });
};

export const reorderQuestions = async (
  quizId: string,
  items: { id: string; orderIndex: number }[],
) => {
  validateReorder(items);
  await prisma.$transaction(
    items.map(({ id, orderIndex }) =>
      prisma.question.update({ where: { id, quizId }, data: { orderIndex } }),
    ),
  );
};

export const addOption = async (
  questionId: string,
  data: { text: string; isCorrect: boolean },
) => {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw notFound("Question not found");
  const agg = await prisma.questionOption.aggregate({
    where: { questionId },
    _max: { orderIndex: true },
  });
  const orderIndex = (agg._max.orderIndex ?? 0) + 1;
  return prisma.questionOption.create({
    data: {
      questionId,
      text: data.text,
      isCorrect: data.isCorrect,
      orderIndex,
    },
  });
};

export const updateOption = async (
  id: string,
  data: { text?: string; isCorrect?: boolean },
) => {
  const opt = await prisma.questionOption.findUnique({ where: { id } });
  if (!opt) throw notFound("Option not found");
  return prisma.questionOption.update({ where: { id }, data });
};

export const deleteOption = async (id: string) => {
  const opt = await prisma.questionOption.findUnique({ where: { id } });
  if (!opt) throw notFound("Option not found");
  await prisma.questionOption.delete({ where: { id } });
};
