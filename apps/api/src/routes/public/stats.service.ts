import { prisma } from '../../db/prisma';

export interface PublicStats {
  students: number;
  courses: number;
  certificatesIssued: number;
  challengeSolvers: number;
}

function roundStat(n: number): number {
  if (n < 100)  return Math.round(n / 10) * 10;
  if (n < 1000) return Math.round(n / 50) * 50;
  return Math.round(n / 100) * 100;
}

export async function getPublicStats(): Promise<PublicStats> {
  const [students, courses, certificates, solvers] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'student' } } }),
    prisma.course.count({ where: { status: 'published' } }),
    prisma.certificate.count(),
    prisma.challengeProgress
      .findMany({ select: { userId: true }, distinct: ['userId'] })
      .then((rows) => rows.length),
  ]);

  return {
    students:           roundStat(students),
    courses:            roundStat(courses),
    certificatesIssued: roundStat(certificates),
    challengeSolvers:   roundStat(solvers),
  };
}
