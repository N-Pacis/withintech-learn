import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { notFound } from '../../utils/errors';

export const listStudentCertificates = async (userId: string) => {
  const [user, certs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        completedAt: true,
        course: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const recipientName = user ? `${user.firstName} ${user.lastName}` : '';
  return certs.map((c) => ({
    id: c.id,
    completedAt: c.completedAt,
    recipientName,
    courseTitle: c.course.title,
    courseSlug: c.course.slug,
  }));
};

export const upsertCertificate = async (userId: string, courseId: string) => {
  return prisma.certificate.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
    select: { id: true, completedAt: true },
  });
};

export const getCertificate = async (userId: string, courseSlug: string) => {
  // Find or auto-generate the certificate if the enrollment is PASSED
  let cert = await prisma.certificate.findFirst({
    where: { userId, course: { slug: courseSlug } },
    select: {
      id: true,
      completedAt: true,
      user: { select: { firstName: true, lastName: true } },
      course: {
        select: {
          title: true,
          slug: true,
          modules: { orderBy: { orderIndex: 'asc' }, select: { title: true } },
        },
      },
    },
  });

  if (!cert) {
    // Resolve completion: final quiz pass OR all modules done (if no quiz)
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        quiz: { select: { id: true } },
        modules: { select: { id: true }, orderBy: { orderIndex: 'desc' }, take: 1 },
      },
    });

    if (!course) throw notFound('Certificate not found');

    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId: course.id } },
      select: { courseId: true, status: true },
    });
    if (!enrollment) throw notFound('Certificate not found');

    let completed = false;
    if (course.quiz) {
      const pass = await prisma.quizAttempt.findFirst({
        where: { userId, quizId: course.quiz.id, status: 'pass' },
        select: { id: true },
      });
      completed = !!pass;
    } else if (course.modules.length > 0) {
      const lastModule = course.modules[0];
      const progress = await prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId, moduleId: lastModule.id } },
        select: { id: true },
      });
      completed = !!progress;
    }

    if (!completed) throw notFound('Certificate not found');

    await Promise.all([
      upsertCertificate(userId, course.id),
      enrollment.status !== 'PASSED'
        ? prisma.studentCourse.update({
            where: { studentId_courseId: { studentId: userId, courseId: course.id } },
            data: { status: 'PASSED' },
          })
        : Promise.resolve(),
    ]);

    cert = await prisma.certificate.findFirst({
      where: { userId, courseId: course.id },
      select: {
        id: true,
        completedAt: true,
        user: { select: { firstName: true, lastName: true } },
        course: {
          select: {
            title: true,
            slug: true,
            modules: { orderBy: { orderIndex: 'asc' }, select: { title: true } },
          },
        },
      },
    });

    if (!cert) throw notFound('Certificate not found');
  }

  return {
    id: cert.id,
    completedAt: cert.completedAt,
    recipientName: `${cert.user.firstName} ${cert.user.lastName}`,
    courseTitle: cert.course.title,
    courseSlug: cert.course.slug,
    modules: cert.course.modules.map((m) => m.title),
  };
};
