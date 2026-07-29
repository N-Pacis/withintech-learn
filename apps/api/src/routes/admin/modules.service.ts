import { prisma } from "../../db/prisma";
import { badRequest, conflict, notFound } from "../../utils/errors";

const validateReorder = (items: { id: string; orderIndex: number }[]) => {
  const indices = items.map((i) => i.orderIndex).sort((a, b) => a - b);
  if (
    indices[0] !== 1 ||
    indices.some((v, i) => i > 0 && v !== indices[i - 1] + 1)
  )
    throw badRequest("orderIndex values must be contiguous starting from 1");
};

export const addModule = async (
  courseId: string,
  data: { title: string; orderIndex: number },
) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound("Course not found");
  try {
    return await prisma.module.create({ data: { courseId, ...data } });
  } catch (e: any) {
    if (e?.code === "P2002")
      throw conflict("A module with this orderIndex already exists");
    throw e;
  }
};

export const listModules = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound("Course not found");
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: {
      quiz: { select: { id: true } },
      _count: { select: { lessons: true } },
    },
  });
  return modules.map(({ quiz, _count, ...mod }) => ({
    ...mod,
    hasQuiz: !!quiz,
    lessonCount: _count.lessons,
  }));
};

export const getModule = async (id: string) => {
  const mod = await prisma.module.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        include: { quiz: { select: { id: true } } },
      },
    },
  });
  if (!mod) throw notFound("Module not found");
  const lessons = mod.lessons.map(({ quiz, ...lesson }) => ({
    ...lesson,
    hasQuiz: !!quiz,
  }));
  return { ...mod, lessons };
};

export const updateModule = async (id: string, title: string) => {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw notFound("Module not found");
  return prisma.module.update({ where: { id }, data: { title } });
};

export const deleteModule = async (id: string) => {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw notFound("Module not found");
  await prisma.module.delete({ where: { id } });
};

export const reorderModules = async (
  courseId: string,
  items: { id: string; orderIndex: number }[],
) => {
  validateReorder(items);
  await prisma.$transaction(async (tx) => {
    // Phase 1: move to temp negative indices so positive values never collide mid-swap
    for (let i = 0; i < items.length; i++) {
      await tx.module.update({
        where: { id: items[i].id, courseId },
        data: { orderIndex: -(i + 1) },
      });
    }
    // Phase 2: set final indices
    for (const { id, orderIndex } of items) {
      await tx.module.update({ where: { id, courseId }, data: { orderIndex } });
    }
  });
};
