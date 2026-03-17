import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../../services/storage.service';

const validateReorder = (items: { id: string; orderIndex: number }[]) => {
  const indices = items.map(i => i.orderIndex).sort((a, b) => a - b);
  if (indices[0] !== 1 || indices.some((v, i) => i > 0 && v !== indices[i - 1] + 1))
    throw badRequest('orderIndex values must be contiguous starting from 1');
};

export const addModule = async (courseId: string, data: { title: string; orderIndex: number }) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound('Course not found');
  try {
    return await prisma.module.create({ data: { courseId, ...data } });
  } catch (e: any) {
    if (e?.code === 'P2002') throw conflict('A module with this orderIndex already exists');
    throw e;
  }
};

export const listModules = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound('Course not found');
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: { quiz: { select: { id: true } } },
  });
  return modules.map(({ quiz, ...mod }) => ({ ...mod, hasQuiz: !!quiz }));
};

export const getModule = async (id: string) => {
  const mod = await prisma.module.findUnique({
    where: { id },
    include: { blocks: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!mod) throw notFound('Module not found');
  const blocks = await Promise.all(mod.blocks.map(async (b) => ({
    ...b,
    url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : null,
  })));
  return { ...mod, blocks };
};

export const updateModule = async (id: string, title: string) => {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw notFound('Module not found');
  return prisma.module.update({ where: { id }, data: { title } });
};

export const deleteModule = async (id: string) => {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw notFound('Module not found');
  await prisma.module.delete({ where: { id } });
};

export const reorderModules = async (courseId: string, items: { id: string; orderIndex: number }[]) => {
  validateReorder(items);
  await prisma.$transaction(async (tx) => {
    // Phase 1: move to temp negative indices so positive values never collide mid-swap
    for (let i = 0; i < items.length; i++) {
      await tx.module.update({ where: { id: items[i].id, courseId }, data: { orderIndex: -(i + 1) } });
    }
    // Phase 2: set final indices
    for (const { id, orderIndex } of items) {
      await tx.module.update({ where: { id, courseId }, data: { orderIndex } });
    }
  });
};

export const addBlock = async (moduleId: string, data: { type: 'text' | 'image' | 'code'; content?: string; caption?: string; language?: string; orderIndex: number }) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw notFound('Module not found');
  try {
    return await prisma.moduleBlock.create({ data: { moduleId, ...data } });
  } catch (e: any) {
    if (e?.code === 'P2002') throw conflict('A block with this orderIndex already exists');
    throw e;
  }
};

export const listBlocks = async (moduleId: string) => {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw notFound('Module not found');
  const blocks = await prisma.moduleBlock.findMany({ where: { moduleId }, orderBy: { orderIndex: 'asc' } });
  return Promise.all(blocks.map(async b => ({
    ...b,
    url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : undefined,
  })));
};

export const updateBlock = async (id: string, data: { content?: string; caption?: string }) => {
  const block = await prisma.moduleBlock.findUnique({ where: { id } });
  if (!block) throw notFound('Block not found');
  return prisma.moduleBlock.update({ where: { id }, data });
};

export const deleteBlock = async (id: string) => {
  const block = await prisma.moduleBlock.findUnique({ where: { id } });
  if (!block) throw notFound('Block not found');
  await prisma.moduleBlock.delete({ where: { id } });
};

export const reorderBlocks = async (moduleId: string, items: { id: string; orderIndex: number }[]) => {
  validateReorder(items);
  await prisma.$transaction(async (tx) => {
    // Phase 1: move to temp negative indices so positive values never collide mid-swap
    for (let i = 0; i < items.length; i++) {
      await tx.moduleBlock.update({ where: { id: items[i].id, moduleId }, data: { orderIndex: -(i + 1) } });
    }
    // Phase 2: set final indices
    for (const { id, orderIndex } of items) {
      await tx.moduleBlock.update({ where: { id, moduleId }, data: { orderIndex } });
    }
  });
};

export const uploadBlockImage = async (moduleId: string, blockId: string, file: Express.Multer.File) => {
  const block = await prisma.moduleBlock.findUnique({ where: { id: blockId } });
  if (!block || block.moduleId !== moduleId) throw notFound('Block not found');
  if (block.type !== 'image') throw badRequest('Block is not an image block');
  if (block.storageKey) await deleteFromS3(block.storageKey);
  const storageKey = await uploadToS3(file, 'blocks');
  await prisma.moduleBlock.update({ where: { id: blockId }, data: { storageKey } });
  const url = await getSignedUrl(storageKey);
  return { storageKey, url };
};
