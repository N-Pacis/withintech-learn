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
          quiz: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!enrollment) return null;

  const moduleProgressMap = new Map(
    (
      await prisma.moduleProgress.findMany({
        where: {
          userId: enrollment.studentId,
          moduleId: { in: enrollment.course.modules.map((m) => m.id) },
        },
        select: { moduleId: true, completedAt: true },
      })
    ).map((p) => [p.moduleId, p.completedAt]),
  );

  const modules = enrollment.course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    orderIndex: m.orderIndex,
    completed: moduleProgressMap.has(m.id),
    completedAt: moduleProgressMap.get(m.id) ?? null,
  }));

  let finalQuiz: { id: string; title: string; passed: boolean; passedAt: Date | null } | null = null;
  if (enrollment.course.quiz) {
    const passAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: enrollment.studentId,
        quizId: enrollment.course.quiz.id,
        status: 'pass',
      },
      select: { createdAt: true },
    });
    finalQuiz = {
      id: enrollment.course.quiz.id,
      title: enrollment.course.quiz.title,
      passed: !!passAttempt,
      passedAt: passAttempt?.createdAt ?? null,
    };
  }

  // ── Attempts worth a second look ──
  // The browser reports how often the student left the tab, lost focus, or
  // tried to leave the quiz page mid-attempt, and how often the clock ran out
  // with nothing submitted. Neither proves anything on its own. Both are worth
  // showing to whoever is marking this student.
  const flaggedAttempts = await prisma.quizAttempt.findMany({
    where: {
      userId: enrollment.studentId,
      OR: [{ warningCount: { gt: 0 } }, { timedOut: true }],
      quiz: {
        OR: [
          { courseId: enrollment.courseId },
          { module: { courseId: enrollment.courseId } },
          { lesson: { module: { courseId: enrollment.courseId } } },
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      score: true,
      status: true,
      warningCount: true,
      timedOut: true,
      createdAt: true,
      quiz: { select: { id: true, title: true } },
    },
  });

  return {
    enrollmentId,
    studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
    courseTitle: enrollment.course.title,
    totalModules: modules.length,
    completedModules: modules.filter((m) => m.completed).length,
    modules,
    finalQuiz,
    flaggedAttempts: flaggedAttempts.map((a) => ({
      id: a.id,
      quizId: a.quiz.id,
      quizTitle: a.quiz.title,
      score: a.score,
      status: a.status,
      warningCount: a.warningCount,
      timedOut: a.timedOut,
      createdAt: a.createdAt,
    })),
  };
}
