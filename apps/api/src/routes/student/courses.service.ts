import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { notFound, badRequest, forbidden } from '../../utils/errors';
import { upsertCertificate } from './certificates.service';
import { getCachedCourse, getCachedModule, buildAndCacheCourse } from '../../services/course-cache.service';

const withThumbnailUrl = async <T extends { thumbnailKey: string | null }>(course: T) => {
  if (!course.thumbnailKey) return { ...course, thumbnailUrl: null };
  return { ...course, thumbnailUrl: await getSignedUrl(course.thumbnailKey) };
};

export type EnrollmentFilter = 'all' | 'enrolled' | 'not_enrolled' | 'passed';

export const listPublishedCourses = async ({
  userId,
  page,
  limit,
  search,
  filter,
}: {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  filter: EnrollmentFilter;
}) => {
  const searchWhere = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  let enrolledCourseIds: string[] | null = null;
  if (filter !== 'all') {
    if (filter === 'not_enrolled') {
      const enrollments = await prisma.studentCourse.findMany({
        where: { studentId: userId },
        select: { courseId: true },
      });
      enrolledCourseIds = enrollments.map((e) => e.courseId);
    } else {
      const status = filter === 'passed' ? 'PASSED' : 'ENROLLED';
      const enrollments = await prisma.studentCourse.findMany({
        where: { studentId: userId, status },
        select: { courseId: true },
      });
      enrolledCourseIds = enrollments.map((e) => e.courseId);
    }
  }

  const filterWhere =
    filter === 'not_enrolled' && enrolledCourseIds
      ? { id: { notIn: enrolledCourseIds } }
      : enrolledCourseIds
        ? { id: { in: enrolledCourseIds } }
        : {};

  const where = { status: 'published' as const, ...searchWhere, ...filterWhere };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnailKey: true,
        status: true,
        _count: { select: { modules: true } },
        enrollments: {
          where: { studentId: userId },
          select: { status: true, enrolledAt: true },
        },
      },
    }),
  ]);

  const coursesWithUrls = await Promise.all(
    courses.map(async (c) => {
      const enrollment = c.enrollments[0] ?? null;
      const { thumbnailKey, _count, enrollments: _, ...rest } = c;
      return {
        ...rest,
        ...(await withThumbnailUrl({ thumbnailKey })),
        module_count: _count.modules,
        enrollment_status: enrollment?.status ?? null,
        enrolled_at: enrollment?.enrolledAt ?? null,
      };
    }),
  );

  return { total, page, limit, courses: coursesWithUrls };
};

// Returns course info + module list with completion status
export const getPublishedCourseBySlug = async (slug: string, userId: string) => {
  // Try cache first; fall back to DB and populate cache on miss
  let cached = await getCachedCourse(slug);
  if (!cached) {
    const dbCourse = await prisma.course.findFirst({ where: { slug, status: 'published' }, select: { id: true } });
    if (!dbCourse) throw notFound('Course not found');
    await buildAndCacheCourse(dbCourse.id);
    cached = await getCachedCourse(slug);
  }
  if (!cached) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: cached.id } },
    select: { status: true, enrolledAt: true },
  });
  if (!enrollment) throw forbidden('You must be enrolled to access this course');

  const [completedSet, lastCourseQuizAttempt] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { userId, moduleId: { in: cached.moduleIds } },
      select: { moduleId: true },
    }).then((rows) => new Set(rows.map((r) => r.moduleId))),
    cached.quiz
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId: cached.quiz.id },
          orderBy: { createdAt: 'desc' },
          select: { id: true, score: true, status: true, createdAt: true },
        })
      : null,
  ]);

  // Modules in cache are ordered; fetch titles from cache via module keys
  const firstIncompleteIndex = cached.moduleIds.findIndex((id) => !completedSet.has(id));
  const reachableUpTo = firstIncompleteIndex === -1 ? cached.moduleIds.length : firstIncompleteIndex;

  const modules = await Promise.all(
    cached.moduleIds.map(async (moduleId, i) => {
      const mod = await getCachedModule(moduleId);
      return {
        id: moduleId,
        title: mod?.title ?? '',
        orderIndex: mod?.orderIndex ?? 0,
        isCompleted: completedSet.has(moduleId),
        isLocked: i > reachableUpTo,
      };
    }),
  );

  return {
    id: cached.id,
    title: cached.title,
    slug: cached.slug,
    description: cached.description,
    status: 'published',
    ...(await withThumbnailUrl({ thumbnailKey: cached.thumbnailKey })),
    enrollment_status: enrollment.status,
    enrolled_at: enrollment.enrolledAt,
    modules,
    quiz: cached.quiz ?? null,
    lastCourseQuizAttempt: lastCourseQuizAttempt ?? null,
  };
};

export const completeCourse = async (slug: string, userId: string) => {
  const course = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    include: { quiz: { select: { id: true } } },
  });
  if (!course) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden('You must be enrolled');
  if (enrollment.status === 'PASSED') throw badRequest('Course already completed');

  if (course.quiz) {
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: course.quiz.id },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });
    if (!lastAttempt || lastAttempt.status !== 'pass') {
      throw badRequest('You must pass the course quiz before completing this course');
    }
  }

  const [updated] = await Promise.all([
    prisma.studentCourse.update({
      where: { studentId_courseId: { studentId: userId, courseId: course.id } },
      data: { status: 'PASSED' },
      select: { id: true, status: true },
    }),
    upsertCertificate(userId, course.id),
  ]);

  return updated;
};

// Returns a single module with blocks + quiz (no isCorrect) + last attempt
export const getStudentModule = async (slug: string, moduleId: string, userId: string) => {
  // Verify enrollment via course cache (or DB fallback)
  let cachedCourse = await getCachedCourse(slug);
  if (!cachedCourse) {
    const dbCourse = await prisma.course.findFirst({ where: { slug, status: 'published' }, select: { id: true } });
    if (!dbCourse) throw notFound('Course not found');
    await buildAndCacheCourse(dbCourse.id);
    cachedCourse = await getCachedCourse(slug);
  }
  if (!cachedCourse) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: cachedCourse.id } },
  });
  if (!enrollment) throw forbidden('You must be enrolled to access this course');

  // Try module cache; fall back to DB
  let cachedMod = await getCachedModule(moduleId);
  if (!cachedMod) {
    await buildAndCacheCourse(cachedCourse.id);
    cachedMod = await getCachedModule(moduleId);
  }
  if (!cachedMod || !cachedCourse.moduleIds.includes(moduleId)) throw notFound('Module not found');

  // Enforce sequential progression: all previous modules must be completed
  const moduleIndex = cachedCourse.moduleIds.indexOf(moduleId);
  if (moduleIndex > 0) {
    const previousIds = cachedCourse.moduleIds.slice(0, moduleIndex);
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: previousIds } },
    });
    if (completedCount < previousIds.length) {
      throw forbidden('You must complete previous modules before accessing this one');
    }
  }

  // Signed URLs for image blocks are generated fresh (presigned URLs expire in 1h)
  const [blocks, lastAttempt] = await Promise.all([
    Promise.all(
      cachedMod.blocks.map(async (b) => ({
        ...b,
        url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : null,
      })),
    ),
    cachedMod.quiz
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId: cachedMod.quiz!.id },
          orderBy: { createdAt: 'desc' },
          select: { id: true, score: true, status: true, createdAt: true },
        })
      : null,
  ]);

  return { ...cachedMod, blocks, lastAttempt: lastAttempt ?? null };
};

export const completeModule = async (slug: string, moduleId: string, userId: string) => {
  const course = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    select: { id: true },
  });
  if (!course) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden('You must be enrolled');

  // Enforce sequential progression
  const courseModules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true },
  });
  const moduleIndex = courseModules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) throw notFound('Module not found');
  if (moduleIndex > 0) {
    const previousIds = courseModules.slice(0, moduleIndex).map((m) => m.id);
    const completedCount = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: previousIds } },
    });
    if (completedCount < previousIds.length) {
      throw forbidden('You must complete previous modules first');
    }
  }

  const mod = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
    include: { quiz: { select: { id: true } } },
  });
  if (!mod) throw notFound('Module not found');

  if (mod.quiz) {
    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: mod.quiz.id },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });
    if (!lastAttempt || lastAttempt.status !== 'pass') {
      throw badRequest('You must pass the quiz before completing this module');
    }
  }

  return prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId },
    update: {},
    select: { id: true, completedAt: true },
  });
};

export const getStudentStats = async (userId: string) => {
  const [enrolled, completed, modulesFinished] = await Promise.all([
    prisma.studentCourse.count({ where: { studentId: userId, status: 'ENROLLED' } }),
    prisma.studentCourse.count({ where: { studentId: userId, status: 'PASSED' } }),
    prisma.moduleProgress.count({ where: { userId } }),
  ]);

  const total = enrolled + completed;
  return {
    enrolled,
    completed,
    modulesFinished,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    total,
  };
};

export const enrollInCourse = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw notFound('Course not found');
  if (course.status !== 'published') throw badRequest('Course is not available for enrollment');

  const existing = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
  });
  if (existing) throw badRequest('Already enrolled in this course');

  return prisma.studentCourse.create({
    data: { studentId: userId, courseId, status: 'ENROLLED' },
  });
};
