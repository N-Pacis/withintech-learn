import redis from "../db/redis";
import { prisma } from "../db/prisma";

// ─── Key helpers ──────────────────────────────────────────────────────────────

const courseKey = (slug: string) => `published_course:${slug}`;
const moduleKey = (moduleId: string) => `published_module:${moduleId}`;

type PlaygroundData = { html?: string; css?: string; js?: string };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CachedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  moduleIds: string[]; // ordered list — used for cache-busting on archive
  quiz: CachedQuiz | null;
  accessType: "FREE" | "PAID_COURSE" | "PAID_CERTIFICATE";
  price: number | null;
  certificatePrice: number | null;
}

interface CachedBlock {
  id: string;
  type: string;
  content: string | null;
  storageKey: string | null;
  caption: string | null;
  language: string | null;
  linkedGroupId: string | null; // NEW
  playgroundData: PlaygroundData | null;
  orderIndex: number;
}

interface CachedQuiz {
  id: string;
  title: string;
  passingScore: number;
  questions: {
    id: string;
    text: string;
    orderIndex: number;
    options: { id: string; text: string; orderIndex: number }[];
  }[];
}

export interface CachedLesson {
  id: string;
  title: string;
  orderIndex: number;
  blocks: CachedBlock[];
  quiz: CachedQuiz | null;
}

export interface CachedModule {
  id: string;
  title: string;
  orderIndex: number;
  lessons: CachedLesson[];
  quiz: CachedQuiz | null;
}

const normalizePlaygroundData = (value: unknown): PlaygroundData | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const data = value as Record<string, unknown>;
  return {
    ...(typeof data.html === "string" ? { html: data.html } : {}),
    ...(typeof data.css === "string" ? { css: data.css } : {}),
    ...(typeof data.js === "string" ? { js: data.js } : {}),
  };
};

const toCachedBlock = (block: {
  id: string;
  type: string;
  content: string | null;
  storageKey: string | null;
  caption: string | null;
  language: string | null;
  linkedGroupId: string | null; // NEW
  playgroundData: unknown;
  orderIndex: number;
}): CachedBlock => ({
  ...block,
  playgroundData: normalizePlaygroundData(block.playgroundData),
});

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
      accessType: true,
      price: true,
      certificatePrice: true,
      modules: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              orderIndex: true,
              blocks: {
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true,
                  type: true,
                  content: true,
                  storageKey: true,
                  caption: true,
                  language: true,
                  linkedGroupId: true, // NEW
                  playgroundData: true,
                  orderIndex: true,
                },
              },
              quiz: {
                select: {
                  id: true,
                  title: true,
                  passingScore: true,
                  questions: {
                    orderBy: { orderIndex: "asc" },
                    select: {
                      id: true,
                      text: true,
                      orderIndex: true,
                      options: {
                        orderBy: { orderIndex: "asc" },
                        select: { id: true, text: true, orderIndex: true },
                      },
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
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true,
                  text: true,
                  orderIndex: true,
                  options: {
                    orderBy: { orderIndex: "asc" },
                    select: { id: true, text: true, orderIndex: true },
                  },
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
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              text: true,
              orderIndex: true,
              options: {
                orderBy: { orderIndex: "asc" },
                select: { id: true, text: true, orderIndex: true },
              },
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
    const { lessons, quiz, ...modMeta } = mod;
    const cachedLessons: CachedLesson[] = lessons.map(
      ({ blocks: lb, quiz: lq, ...lMeta }) => ({
        ...lMeta,
        blocks: lb.map(toCachedBlock),
        quiz: lq ?? null,
      }),
    );
    const cached: CachedModule = {
      ...modMeta,
      lessons: cachedLessons,
      quiz: quiz ?? null,
    };
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
    accessType: course.accessType as
      | "FREE"
      | "PAID_COURSE"
      | "PAID_CERTIFICATE",
    price: course.price,
    certificatePrice: course.certificatePrice,
  };
  pipeline.set(courseKey(course.slug), JSON.stringify(cachedCourse));

  await pipeline.exec();
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getCachedCourse = async (
  slug: string,
): Promise<CachedCourse | null> => {
  const raw = await redis.get(courseKey(slug));
  return raw ? (JSON.parse(raw) as CachedCourse) : null;
};

export const getCachedModule = async (
  moduleId: string,
): Promise<CachedModule | null> => {
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
