import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { notFound, badRequest, forbidden } from '../../utils/errors';

const withThumbnailUrl = async <T extends { thumbnailKey: string | null }>(course: T) => {
  if (!course.thumbnailKey) return { ...course, thumbnailUrl: null };
  return { ...course, thumbnailUrl: await getSignedUrl(course.thumbnailKey) };
};

export type EnrollmentFilter = 'all' | 'enrolled' | 'not_enrolled';

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

  // For enrolled/not_enrolled filter we first need the student's enrolled course ids
  let enrolledCourseIds: string[] | null = null;
  if (filter !== 'all') {
    const enrollments = await prisma.studentCourse.findMany({
      where: { studentId: userId },
      select: { courseId: true },
    });
    enrolledCourseIds = enrollments.map((e) => e.courseId);
  }

  const filterWhere =
    filter === 'enrolled' && enrolledCourseIds
      ? { id: { in: enrolledCourseIds } }
      : filter === 'not_enrolled' && enrolledCourseIds
        ? { id: { notIn: enrolledCourseIds } }
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

export const getPublishedCourseBySlug = async (slug: string, userId: string) => {
  const course = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: { blocks: { orderBy: { orderIndex: 'asc' } } },
      },
      quiz: { include: { questions: { orderBy: { orderIndex: 'asc' }, include: { options: { orderBy: { orderIndex: 'asc' } } } } } },
    },
  });
  if (!course) throw notFound('Course not found');

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId: course.id } },
    select: { status: true, enrolledAt: true },
  });

  if (!enrollment) throw forbidden('You must be enrolled to access this course');

  const { thumbnailKey, ...rest } = course;
  return {
    ...rest,
    ...(await withThumbnailUrl({ thumbnailKey })),
    enrollment_status: enrollment?.status ?? null,
    enrolled_at: enrollment?.enrolledAt ?? null,
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
