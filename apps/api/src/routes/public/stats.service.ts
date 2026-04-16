import { prisma } from '../../db/prisma';
import redis from '../../db/redis';

export interface PublicStats {
  students: number;
  courses: number;
  certificatesIssued: number;
  challengeSolvers: number;
}

const CACHE_KEY = 'public:stats';
const TTL = 24 * 60 * 60; // 24 h (seconds for Redis SETEX)

function roundStat(n: number): number {
  if (n < 100)  return Math.round(n / 10) * 10;
  if (n < 1000) return Math.round(n / 50) * 50;
  return Math.round(n / 100) * 100;
}

export async function getPublicStats(): Promise<PublicStats> {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached) as PublicStats;

  const [students, courses, certificates, [{ count: solvers }]] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'student' } } }),
    prisma.course.count({ where: { status: 'published' } }),
    prisma.certificate.count(),
    prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(DISTINCT "userId")::int AS count FROM "ChallengeProgress"
    `,
  ]);

  const data: PublicStats = {
    students:           roundStat(students),
    courses,
    certificatesIssued: roundStat(certificates),
    challengeSolvers:   roundStat(Number(solvers)),
  };

  await redis.setex(CACHE_KEY, TTL, JSON.stringify(data));
  return data;
}
