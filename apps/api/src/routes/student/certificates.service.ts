import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { forbidden, notFound } from '../../utils/errors';

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
          id: true,
          title: true,
          slug: true,
          accessType: true,
          modules: { orderBy: { orderIndex: 'asc' }, select: { title: true } },
        },
      },
    },
  });

  // Belt-and-suspenders: even if a cert row exists, verify payment for PAID_CERTIFICATE.
  // Guards against certs created by older code paths that skipped the payment check.
  if (cert && cert.course.accessType === 'PAID_CERTIFICATE') {
    const certPayment = await prisma.payment.findFirst({
      where: { userId, courseId: cert.course.id, type: 'CERTIFICATE', status: 'PAID' },
    });
    if (!certPayment) throw forbidden('Certificate payment required');
  }

  if (!cert) {
    // Resolve completion: final quiz pass OR all modules done (if no quiz)
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        accessType: true,
        quiz: { select: { id: true } },
        modules: { select: { id: true }, orderBy: { orderIndex: 'desc' }, take: 1 },
      },
    });

    if (!course) throw notFound('Certificate not found');

    // PAID_CERTIFICATE courses require a confirmed certificate payment before
    // a certificate can be issued. Check this before any completion logic so
    // that a student who has completed the course but not paid cannot bypass
    // the gate by hitting this public endpoint directly.
    if (course.accessType === 'PAID_CERTIFICATE') {
      const certPayment = await prisma.payment.findFirst({
        where: { userId, courseId: course.id, type: 'CERTIFICATE', status: 'PAID' },
      });
      if (!certPayment) throw forbidden('Certificate payment required');
    }

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
      // Only mark PASSED here for free/paid-course types.
      // PAID_CERTIFICATE courses are marked PASSED by the payment flow.
      enrollment.status !== 'PASSED' && course.accessType !== 'PAID_CERTIFICATE'
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
