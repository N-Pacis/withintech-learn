import redis from '../db/redis';
import { prisma } from '../db/prisma';

// ─── Key helpers ──────────────────────────────────────────────────────────────

const courseKey  = (slug: string)     => `published_course:${slug}`;
const moduleKey  = (moduleId: string) => `published_module:${moduleId}`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CachedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  moduleIds: string[]; // ordered list — used for cache-busting on archive
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: {
      id: string;
      text: string;
      orderIndex: number;
      options: { id: string; text: string; orderIndex: number }[];
    }[];
  } | null;
}

export interface CachedModule {
  id: string;
  title: string;
  orderIndex: number;
  blocks: {
    id: string;
    type: string;
    content: string | null;
    storageKey: string | null;
    caption: string | null;
    language: string | null;
    orderIndex: number;
  }[];
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: {
      id: string;
      text: string;
      orderIndex: number;
      options: { id: string; text: string; orderIndex: number }[];
    }[];
  } | null;
}

// ─── Build & store ────────────────────────────────────────────────────────────

export const buildAndCacheCourse = async (courseId: string): Promise<void> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailKey: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          blocks: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true, type: true, content: true, storageKey: true, caption: true, language: true, orderIndex: true },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              passingScore: true,
              questions: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  text: true,
                  orderIndex: true,
                  options: { orderBy: { orderIndex: 'asc' }, select: { id: true, text: true, orderIndex: true } },
                },
              },
            },
          },
        },
      },
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          questions: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              text: true,
              orderIndex: true,
              options: { orderBy: { orderIndex: 'asc' }, select: { id: true, text: true, orderIndex: true } },
            },
          },
        },
      },
    },
  });
  if (!course) return;

  const pipeline = redis.pipeline();

  // Cache each module individually
  for (const mod of course.modules) {
    const { blocks, quiz, ...modMeta } = mod;
    const cached: CachedModule = { ...modMeta, blocks, quiz: quiz ?? null };
    pipeline.set(moduleKey(mod.id), JSON.stringify(cached));
  }

  // Cache the course (without per-module blocks — those live in module keys)
  const cachedCourse: CachedCourse = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnailKey: course.thumbnailKey,
    moduleIds: course.modules.map((m) => m.id),
    quiz: course.quiz ?? null,
  };
  pipeline.set(courseKey(course.slug), JSON.stringify(cachedCourse));

  await pipeline.exec();
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getCachedCourse = async (slug: string): Promise<CachedCourse | null> => {
  const raw = await redis.get(courseKey(slug));
  return raw ? (JSON.parse(raw) as CachedCourse) : null;
};

export const getCachedModule = async (moduleId: string): Promise<CachedModule | null> => {
  const raw = await redis.get(moduleKey(moduleId));
  return raw ? (JSON.parse(raw) as CachedModule) : null;
};

// ─── Invalidate ───────────────────────────────────────────────────────────────

export const invalidateCourseCache = async (slug: string): Promise<void> => {
  const raw = await redis.get(courseKey(slug));
  const pipeline = redis.pipeline();
  if (raw) {
    const cached = JSON.parse(raw) as CachedCourse;
    for (const moduleId of cached.moduleIds) {
      pipeline.del(moduleKey(moduleId));
    }
  }
  pipeline.del(courseKey(slug));
  await pipeline.exec();
};
