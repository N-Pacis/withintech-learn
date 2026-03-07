import { prisma } from '../../db/prisma';
import { badRequest, notFound } from '../../utils/errors';

const validateReorder = (items: { id: string; orderIndex: number }[]) => {
  const indices = items.map(i => i.orderIndex).sort((a, b) => a - b);
  if (indices[0] !== 1 || indices.some((v, i) => i > 0 && v !== indices[i - 1] + 1))
    throw badRequest('orderIndex values must be contiguous starting from 1');
};

export const createModuleQuiz = async (moduleId: string, data: { title: string; passingScore: number; maxAttempts: number }) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { quiz: true } });
  if (!mod) throw notFound('Module not found');
  if (mod.quiz) throw badRequest('Module already has a quiz');
  return prisma.quiz.create({ data: { moduleId, ...data } });
};

export const createCourseQuiz = async (courseId: string, data: { title: string; passingScore: number; maxAttempts: number }) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { quiz: true } });
  if (!course) throw notFound('Course not found');
  if (course.quiz) throw badRequest('Course already has a quiz');
  return prisma.quiz.create({ data: { courseId, ...data } });
};

export const getQuiz = async (id: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  });
  if (!quiz) throw notFound('Quiz not found');
  return quiz;
};

export const updateQuiz = async (id: string, data: { title?: string; passingScore?: number; maxAttempts?: number }) => {
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) throw notFound('Quiz not found');
  return prisma.quiz.update({ where: { id }, data });
};

export const deleteQuiz = async (id: string) => {
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) throw notFound('Quiz not found');
  await prisma.quiz.delete({ where: { id } });
};

export const addQuestion = async (quizId: string, data: { text: string; orderIndex: number }) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw notFound('Quiz not found');
  return prisma.question.create({ data: { quizId, ...data } });
};

export const updateQuestion = async (id: string, text: string) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw notFound('Question not found');
  return prisma.question.update({ where: { id }, data: { text } });
};

export const deleteQuestion = async (id: string) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw notFound('Question not found');
  await prisma.question.delete({ where: { id } });
};

export const reorderQuestions = async (quizId: string, items: { id: string; orderIndex: number }[]) => {
  validateReorder(items);
  await prisma.$transaction(
    items.map(({ id, orderIndex }) => prisma.question.update({ where: { id, quizId }, data: { orderIndex } }))
  );
};

export const addOption = async (questionId: string, data: { text: string; isCorrect: boolean; orderIndex: number }) => {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw notFound('Question not found');
  return prisma.questionOption.create({ data: { questionId, ...data } });
};

export const updateOption = async (id: string, data: { text?: string; isCorrect?: boolean }) => {
  const opt = await prisma.questionOption.findUnique({ where: { id } });
  if (!opt) throw notFound('Option not found');
  if (data.isCorrect === false && opt.isCorrect) {
    const correctCount = await prisma.questionOption.count({ where: { questionId: opt.questionId, isCorrect: true } });
    if (correctCount === 1) throw badRequest('At least one option must be correct');
  }
  return prisma.questionOption.update({ where: { id }, data });
};

export const deleteOption = async (id: string) => {
  const opt = await prisma.questionOption.findUnique({ where: { id } });
  if (!opt) throw notFound('Option not found');
  if (opt.isCorrect) {
    const correctCount = await prisma.questionOption.count({ where: { questionId: opt.questionId, isCorrect: true } });
    if (correctCount === 1) throw badRequest('Cannot delete the only correct option');
  }
  await prisma.questionOption.delete({ where: { id } });
};
