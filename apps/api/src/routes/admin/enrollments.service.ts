import { prisma } from '../../db/prisma';

export interface ListEnrollmentsOptions {
  search?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}

export async function listEnrollments({ search, courseId, page = 1, limit = 50 }: ListEnrollmentsOptions) {
  const where = {
    ...(search
      ? {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
    ...(courseId ? { courseId } : {}),
  };

  const [total, enrollments] = await Promise.all([
    prisma.studentCourse.count({ where }),
    prisma.studentCourse.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    total,
    page,
    limit,
    enrollments: enrollments.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      studentName: `${e.student.firstName} ${e.student.lastName}`,
      courseId: e.courseId,
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt,
      status: e.status === 'PASSED' ? 'completed' : 'in_progress',
    })),
  };
}

export async function getEnrollmentProgress(enrollmentId: string) {
  const enrollment = await prisma.studentCourse.findUnique({
    where: { id: enrollmentId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      course: {
        select: {
          id: true,
          title: true,
          modules: {
            select: { id: true, title: true, orderIndex: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!enrollment) return null;

  const completedModuleIds = new Set(
    (
      await prisma.moduleProgress.findMany({
        where: {
          userId: enrollment.studentId,
          moduleId: { in: enrollment.course.modules.map((m) => m.id) },
        },
        select: { moduleId: true },
      })
    ).map((p) => p.moduleId),
  );

  const modules = enrollment.course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    orderIndex: m.orderIndex,
    completed: completedModuleIds.has(m.id),
  }));

  return {
    enrollmentId,
    studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
    courseTitle: enrollment.course.title,
    totalModules: modules.length,
    completedModules: modules.filter((m) => m.completed).length,
    modules,
  };
}
