import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { notFound, badRequest, forbidden } from '../../utils/errors';
import { upsertCertificate } from './certificates.service';

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
  const course = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailKey: true,
      status: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true, orderIndex: true },
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
              options: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true, text: true, orderIndex: true },
              },
            },
          },
        },
      },
    },
  });
  if (!course) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
    select: { status: true, enrolledAt: true },
  });
  if (!enrollment) throw forbidden('You must be enrolled to access this course');

  const [completedSet, lastCourseQuizAttempt] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { userId, moduleId: { in: course.modules.map((m) => m.id) } },
      select: { moduleId: true },
    }).then((rows) => new Set(rows.map((r) => r.moduleId))),
    course.quiz
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId: course.quiz.id },
          orderBy: { createdAt: 'desc' },
          select: { id: true, score: true, status: true, createdAt: true },
        })
      : null,
  ]);

  const { thumbnailKey, ...rest } = course;
  return {
    ...rest,
    ...(await withThumbnailUrl({ thumbnailKey })),
    enrollment_status: enrollment.status,
    enrolled_at: enrollment.enrolledAt,
    modules: course.modules.map((m) => ({ ...m, isCompleted: completedSet.has(m.id) })),
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
  const course = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    select: { id: true },
  });
  if (!course) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
  });
  if (!enrollment) throw forbidden('You must be enrolled to access this course');

  const mod = await prisma.module.findFirst({
    where: { id: moduleId, courseId: course.id },
    include: {
      blocks: { orderBy: { orderIndex: 'asc' } },
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
              options: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true, text: true, orderIndex: true }, // isCorrect intentionally excluded
              },
            },
          },
        },
      },
    },
  });
  if (!mod) throw notFound('Module not found');

  const [blocks, lastAttempt] = await Promise.all([
    Promise.all(
      mod.blocks.map(async (b) => ({
        ...b,
        url: b.type === 'image' && b.storageKey ? await getSignedUrl(b.storageKey) : null,
      })),
    ),
    mod.quiz
      ? prisma.quizAttempt.findFirst({
          where: { userId, quizId: mod.quiz.id },
          orderBy: { createdAt: 'desc' },
          select: { id: true, score: true, status: true, createdAt: true },
        })
      : null,
  ]);

  return { ...mod, blocks, lastAttempt: lastAttempt ?? null };
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
