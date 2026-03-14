import { prisma } from '../../db/prisma';

export interface ListEnrollmentsOptions {
  search?: string;
  course?: string;
}

export async function listEnrollments({ search, course }: ListEnrollmentsOptions) {
  const enrollments = await prisma.studentCourse.findMany({
    where: {
      ...(search
        ? {
            student: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      ...(course
        ? { course: { title: { contains: course, mode: 'insensitive' } } }
        : {}),
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  return enrollments.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    studentName: `${e.student.firstName} ${e.student.lastName}`,
    courseId: e.courseId,
    courseTitle: e.course.title,
    enrolledAt: e.enrolledAt,
    status: e.status === 'PASSED' ? 'completed' : 'in_progress',
  }));
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
