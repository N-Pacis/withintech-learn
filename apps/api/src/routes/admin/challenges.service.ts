import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../utils/errors';
import {
  buildAndCacheChallenge,
  getCachedAdminChallenge,
  invalidateChallengeCache,
} from '../../services/challenge-cache.service';
import {
  DEFAULT_CHALLENGE_STARTER_CODE,
  generateStarterCode,
  type FunctionParam,
} from '../challenges.constants';
import {
  executeChallengeSubmission,
  formatChallengeResults,
} from '../challenges.execution';

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const uniqueSlug = (title: string) =>
  `${toSlug(title)}-${Date.now()}`;

// ─── Challenges ───────────────────────────────────────────────────────────────

export const createChallenge = async (data: {
  title:          string;
  description:    string;
  difficulty:     'easy' | 'medium' | 'hard';
  starterCode?:   object;
  functionParams?: FunctionParam[];
  returnType?:    string;
  timeLimit:      number;
  orderIndex:     number;
  userId:         string;
}) => {
  const slug = uniqueSlug(data.title);

  // If function params are provided, auto-generate starter code unless caller supplied one
  let starterCode: object = data.starterCode ?? DEFAULT_CHALLENGE_STARTER_CODE;
  if (data.functionParams && data.functionParams.length > 0 && data.returnType && !data.starterCode) {
    starterCode = generateStarterCode(data.functionParams, data.returnType);
  }

  return prisma.challenge.create({
    data: {
      title:          data.title,
      slug,
      description:    data.description,
      difficulty:     data.difficulty,
      starterCode,
      functionParams: data.functionParams ? data.functionParams as object[] : undefined,
      returnType:     data.returnType,
      timeLimit:      data.timeLimit,
      orderIndex:     data.orderIndex,
      createdById:    data.userId,
    },
  });
};

export const listChallenges = async ({
  page,
  limit,
  difficulty,
  status,
}: {
  page: number;
  limit: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'draft' | 'published';
}) => {
  const where = {
    ...(difficulty ? { difficulty } : {}),
    ...(status ? { status } : {}),
  };
  const [total, challenges] = await Promise.all([
    prisma.challenge.count({ where }),
    prisma.challenge.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { testCases: true, submissions: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  ]);
  return { total, page, limit, challenges };
};

export const getChallenge = async (id: string) => {
  const cached = await getCachedAdminChallenge(id);
  if (cached) return cached;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      testCases:  { orderBy: { orderIndex: 'asc' } },
      createdBy:  { select: { id: true, firstName: true, lastName: true } },
      _count:     { select: { submissions: true } },
    },
  });
  if (!challenge) throw notFound('Challenge not found');

  // Populate cache for next request — fire-and-forget
  buildAndCacheChallenge(id).catch(() => {});

  return challenge;
};

export const updateChallenge = async (id: string, data: {
  title?:          string;
  description?:    string;
  difficulty?:     'easy' | 'medium' | 'hard';
  starterCode?:    object;
  functionParams?: FunctionParam[];
  returnType?:     string;
  timeLimit?:      number;
  orderIndex?:     number;
}) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'published' && data.title !== undefined)
    throw badRequest('Title cannot be changed after publishing. Unpublish first.');

  // If function params changed and no explicit starter code given, regenerate starter code
  const updateData: Record<string, unknown> = { ...data };
  if (data.functionParams && data.returnType && data.starterCode === undefined) {
    updateData.starterCode = generateStarterCode(data.functionParams, data.returnType);
  }

  const updated = await prisma.challenge.update({ where: { id }, data: updateData });
  // Rebuild cache — if unpublished (draft) the student key will be left alone by
  // buildAndCacheChallenge since it only sets the student key for published challenges.
  // Invalidate student key only if slug changed (slug is immutable after publish, so safe).
  await buildAndCacheChallenge(id);
  return updated;
};

export const deleteChallenge = async (id: string) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'published')
    throw badRequest('Cannot delete a published challenge. Unpublish it first.');
  await prisma.challenge.delete({ where: { id } });
};

export const publishChallenge = async (id: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { _count: { select: { testCases: true } } },
  });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'published') throw conflict('Challenge is already published');
  if (challenge._count.testCases === 0)
    throw badRequest('Add at least one test case before publishing');

  const published = await prisma.challenge.update({ where: { id }, data: { status: 'published' } });
  await buildAndCacheChallenge(id);
  return published;
};

export const unpublishChallenge = async (id: string) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'draft') throw conflict('Challenge is already unpublished');
  const unpublished = await prisma.challenge.update({ where: { id }, data: { status: 'draft' } });
  // Invalidate both keys — draft challenges must not be served from student cache
  await invalidateChallengeCache(id, challenge.slug);
  // Rebuild admin cache so the admin UI reflects the new status immediately
  await buildAndCacheChallenge(id);
  return unpublished;
};

// ─── Test Cases ───────────────────────────────────────────────────────────────

export const addTestCase = async (challengeId: string, data: {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
}) => {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw notFound('Challenge not found');

  // Shift existing test cases if orderIndex is taken.
  // Must iterate in descending order — updateMany with increment can trigger transient
  // unique-constraint violations when the DB shifts rows in undefined order.
  const existing = await prisma.challengeTestCase.findFirst({
    where: { challengeId, orderIndex: data.orderIndex },
    select: { id: true },
  });
  if (existing) {
    const toShift = await prisma.challengeTestCase.findMany({
      where:   { challengeId, orderIndex: { gte: data.orderIndex } },
      orderBy: { orderIndex: 'desc' },
      select:  { id: true, orderIndex: true },
    });
    for (const tc of toShift) {
      await prisma.challengeTestCase.update({
        where: { id: tc.id },
        data:  { orderIndex: tc.orderIndex + 1 },
      });
    }
  }

  const tc = await prisma.challengeTestCase.create({
    data: { challengeId, ...data },
  });
  buildAndCacheChallenge(challengeId).catch(() => {});
  return tc;
};

export const updateTestCase = async (testCaseId: string, data: {
  input?: string;
  expectedOutput?: string;
  isHidden?: boolean;
  orderIndex?: number;
}) => {
  const tc = await prisma.challengeTestCase.findUnique({ where: { id: testCaseId } });
  if (!tc) throw notFound('Test case not found');
  return prisma.challengeTestCase.update({ where: { id: testCaseId }, data });
};

export const deleteTestCase = async (testCaseId: string) => {
  const tc = await prisma.challengeTestCase.findUnique({ where: { id: testCaseId } });
  if (!tc) throw notFound('Test case not found');
  await prisma.challengeTestCase.delete({ where: { id: testCaseId } });
  buildAndCacheChallenge(tc.challengeId).catch(() => {});
};

export const getChallengeStats = async (id: string) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');

  const [statusRows, langRows, trendRows, uniqueAttempts, uniqueSolvers] = await Promise.all([
    // Status breakdown
    prisma.$queryRaw<{ status: string; cnt: number }[]>`
      SELECT status, COUNT(*)::int AS cnt
      FROM "ChallengeSubmission"
      WHERE "challengeId" = ${id}
      GROUP BY status
    `,
    // Language breakdown
    prisma.$queryRaw<{ language: string; cnt: number }[]>`
      SELECT language, COUNT(*)::int AS cnt
      FROM "ChallengeSubmission"
      WHERE "challengeId" = ${id}
      GROUP BY language
      ORDER BY cnt DESC
    `,
    // 30-day daily trend
    prisma.$queryRaw<{ date: string; total: number; accepted: number }[]>`
      SELECT
        TO_CHAR("submittedAt"::date, 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted
      FROM "ChallengeSubmission"
      WHERE "challengeId" = ${id}
        AND "submittedAt" >= NOW() - INTERVAL '30 days'
      GROUP BY "submittedAt"::date
      ORDER BY "submittedAt"::date ASC
    `,
    // Unique users who attempted
    prisma.challengeSubmission.findMany({
      where: { challengeId: id },
      select: { userId: true },
      distinct: ['userId'],
    }),
    // Unique users who solved
    prisma.challengeSubmission.findMany({
      where: { challengeId: id, status: 'accepted' },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);

  const totalSubmissions = statusRows.reduce((s, r) => s + Number(r.cnt), 0);
  const acceptedCount = statusRows.find(r => r.status === 'accepted')?.cnt ?? 0;

  const statusBreakdown: Record<string, number> = {};
  for (const r of statusRows) statusBreakdown[r.status] = Number(r.cnt);

  const languageBreakdown: Record<string, number> = {};
  for (const r of langRows) languageBreakdown[r.language] = Number(r.cnt);

  return {
    totalSubmissions,
    uniqueAttempts: uniqueAttempts.length,
    uniqueSolvers: uniqueSolvers.length,
    acceptedCount: Number(acceptedCount),
    passRate: totalSubmissions > 0 ? Math.round((Number(acceptedCount) / totalSubmissions) * 100) : 0,
    statusBreakdown,
    languageBreakdown,
    submissionTrend: trendRows.map(r => ({
      date: r.date,
      total: Number(r.total),
      accepted: Number(r.accepted),
    })),
  };
};

export const runChallenge = async (id: string, data: {
  language: string;
  code: string;
}) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { testCases: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!challenge) throw notFound('Challenge not found');

  const executorResult = await executeChallengeSubmission({
    language:       data.language,
    code:           data.code,
    testCases:      challenge.testCases,
    timeLimit:      challenge.timeLimit,
    functionParams: challenge.functionParams as unknown as FunctionParam[] | undefined,
    returnType:     challenge.returnType ?? undefined,
  });

  return {
    submissionId: null,
    status:       executorResult.status,
    testsPassed:  executorResult.testsPassed,
    totalTests:   executorResult.totalTests,
    compileError: executorResult.compileError ?? null,
    results:      formatChallengeResults(executorResult, challenge.testCases, { revealHidden: true }),
  };
};
