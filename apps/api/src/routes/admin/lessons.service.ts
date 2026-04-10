import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../../services/storage.service';

const validateReorder = (items: { id: string; orderIndex: number }[]) => {
  const indices = items.map(i => i.orderIndex).sort((a, b) => a - b);
  if (indices[0] !== 1 || indices.some((v, i) => i > 0 && v !== indices[i - 1] + 1))
    throw badRequest('orderIndex values must be contiguous starting from 1');
};

// ─── Lesson CRUD ──────────────────────────────────────────────────────────────

export const addLesson = async (moduleId: string, data: { title: string; orderIndex: number }) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw notFound('Module not found');
  try {
    return await prisma.lesson.create({ data: { moduleId, ...data } });
  } catch (e: any) {
    if (e?.code === 'P2002') throw conflict('A lesson with this orderIndex already exists');
    throw e;
  }
};

export const listLessons = async (moduleId: string) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw notFound('Module not found');
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { orderIndex: 'asc' },
    include: { quiz: { select: { id: true } } },
  });
  return lessons.map(({ quiz, ...lesson }) => ({ ...lesson, hasQuiz: !!quiz }));
};

export const getLesson = async (id: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { orderIndex: 'asc' } },
      quiz: { select: { id: true } },
    },
  });
  if (!lesson) throw notFound('Lesson not found');
  const blocks = await Promise.all(lesson.blocks.map(async (b) => ({
    ...b,
    url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : null,
  })));
  return { ...lesson, blocks, hasQuiz: !!lesson.quiz };
};

export const updateLesson = async (id: string, title: string) => {
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) throw notFound('Lesson not found');
  return prisma.lesson.update({ where: { id }, data: { title } });
};

export const deleteLesson = async (id: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { blocks: { select: { storageKey: true } } },
  });
  if (!lesson) throw notFound('Lesson not found');
  const imageKeys = lesson.blocks.map(b => b.storageKey).filter((k): k is string => !!k);
  await Promise.all(imageKeys.map(deleteFromS3));
  await prisma.lesson.delete({ where: { id } });
};

export const reorderLessons = async (moduleId: string, items: { id: string; orderIndex: number }[]) => {
  validateReorder(items);
  await prisma.$transaction(async (tx) => {
    // Phase 1: move to temp negative indices so positive values never collide mid-swap
    for (let i = 0; i < items.length; i++) {
      await tx.lesson.update({ where: { id: items[i].id, moduleId }, data: { orderIndex: -(i + 1) } });
    }
    // Phase 2: set final indices
    for (const { id, orderIndex } of items) {
      await tx.lesson.update({ where: { id, moduleId }, data: { orderIndex } });
    }
  });
};

// ─── Lesson Block CRUD ────────────────────────────────────────────────────────

export const addLessonBlock = async (lessonId: string, data: { type: 'text' | 'image' | 'code'; content?: string; caption?: string; language?: string; orderIndex: number }) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw notFound('Lesson not found');
  try {
    return await prisma.lessonBlock.create({ data: { lessonId, ...data } });
  } catch (e: any) {
    if (e?.code === 'P2002') throw conflict('A block with this orderIndex already exists');
    throw e;
  }
};

export const listLessonBlocks = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw notFound('Lesson not found');
  const blocks = await prisma.lessonBlock.findMany({ where: { lessonId }, orderBy: { orderIndex: 'asc' } });
  return Promise.all(blocks.map(async b => ({
    ...b,
    url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : undefined,
  })));
};

export const updateLessonBlock = async (id: string, data: { content?: string; caption?: string; language?: string }) => {
  const block = await prisma.lessonBlock.findUnique({ where: { id } });
  if (!block) throw notFound('Block not found');
  return prisma.lessonBlock.update({ where: { id }, data });
};

export const deleteLessonBlock = async (id: string) => {
  const block = await prisma.lessonBlock.findUnique({ where: { id } });
  if (!block) throw notFound('Block not found');
  if (block.storageKey) await deleteFromS3(block.storageKey);
  await prisma.lessonBlock.delete({ where: { id } });
};

export const reorderLessonBlocks = async (lessonId: string, items: { id: string; orderIndex: number }[]) => {
  validateReorder(items);
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < items.length; i++) {
      await tx.lessonBlock.update({ where: { id: items[i].id, lessonId }, data: { orderIndex: -(i + 1) } });
    }
    for (const { id, orderIndex } of items) {
      await tx.lessonBlock.update({ where: { id, lessonId }, data: { orderIndex } });
    }
  });
};

export const uploadLessonBlockImage = async (lessonId: string, blockId: string, file: Express.Multer.File) => {
  const block = await prisma.lessonBlock.findUnique({ where: { id: blockId } });
  if (!block || block.lessonId !== lessonId) throw notFound('Block not found');
  if (block.type !== 'image') throw badRequest('Block is not an image block');
  if (block.storageKey) await deleteFromS3(block.storageKey);
  const storageKey = await uploadToS3(file, 'blocks');
  await prisma.lessonBlock.update({ where: { id: blockId }, data: { storageKey } });
  const url = await getSignedUrl(storageKey);
  return { storageKey, url };
};
