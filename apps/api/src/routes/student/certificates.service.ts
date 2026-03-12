import { prisma } from '../../db/prisma';
import { notFound } from '../../utils/errors';

export const upsertCertificate = async (userId: string, courseId: string) => {
  return prisma.certificate.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
    select: { id: true, completedAt: true },
  });
};

export const getCertificate = async (userId: string, courseSlug: string) => {
  const cert = await prisma.certificate.findFirst({
    where: {
      userId,
      course: { slug: courseSlug },
    },
    select: {
      id: true,
      completedAt: true,
      user: { select: { firstName: true, lastName: true } },
      course: {
        select: {
          title: true,
          slug: true,
          modules: {
            orderBy: { orderIndex: 'asc' },
            select: { title: true },
          },
        },
      },
    },
  });

  if (!cert) throw notFound('Certificate not found');

  return {
    id: cert.id,
    completedAt: cert.completedAt,
    recipientName: `${cert.user.firstName} ${cert.user.lastName}`,
    courseTitle: cert.course.title,
    courseSlug: cert.course.slug,
    modules: cert.course.modules.map((m) => m.title),
  };
};
