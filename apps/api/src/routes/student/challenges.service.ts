import { SubmissionStatus } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { notFound } from '../../utils/errors';
import { type FunctionParam } from '../challenges.constants';
import {
  getCachedStudentChallenge,
  getCachedAdminChallenge,
  buildAndCacheChallenge,
} from '../../services/challenge-cache.service';
import {
  executeChallengeSubmission,
  formatChallengeResults,
} from '../challenges.execution';

// ─── List Challenges ──────────────────────────────────────────────────────────

export const listPublishedChallenges = async ({
  userId,
  page,
  limit,
  difficulty,
}: {
  userId: string;
  page: number;
  limit: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}) => {
  const where = {
    status: 'published' as const,
    ...(difficulty ? { difficulty } : {}),
  };

  const [total, challenges] = await Promise.all([
    prisma.challenge.count({ where }),
    prisma.challenge.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        number: true,
        title: true,
        slug: true,
        difficulty: true,
        _count:     { select: { testCases: true } },
        progress:   { where: { userId }, select: { id: true, completedAt: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    challenges: challenges.map(c => ({
      id:         c.id,
      number:     c.number,
      title:      c.title,
      slug:       c.slug,
      difficulty: c.difficulty,
      testCount:  c._count.testCases,
      completed:  c.progress.length > 0,
      completedAt: c.progress[0]?.completedAt ?? null,
    })),
  };
};

// ─── Get Challenge Detail ─────────────────────────────────────────────────────

export const getPublishedChallenge = async (slug: string, userId: string) => {
  // Try cache for the static challenge data
  let cached = await getCachedStudentChallenge(slug);

  if (!cached) {
    // Cache miss — verify it exists and is published, then populate
    const dbChallenge = await prisma.challenge.findFirst({
      where: { slug, status: 'published' },
      select: { id: true },
    });
    if (!dbChallenge) throw notFound('Challenge not found');

    await buildAndCacheChallenge(dbChallenge.id);
    cached = await getCachedStudentChallenge(slug);
    if (!cached) throw notFound('Challenge not found');
  }

  // Per-user progress is never cached — cheap single-row lookup
  const progress = await prisma.challengeProgress.findUnique({
    where: { userId_challengeId: { userId, challengeId: cached.id } },
    select: { completedAt: true },
  });

  return {
    id:               cached.id,
    title:            cached.title,
    slug:             cached.slug,
    description:      cached.description,
    difficulty:       cached.difficulty,
    starterCode:      cached.starterCode,
    functionParams:   cached.functionParams,
    returnType:       cached.returnType,
    timeLimit:        cached.timeLimit,
    visibleTestCases: cached.visibleTestCases,
    completed:        !!progress,
    completedAt:      progress?.completedAt ?? null,
  };
};

// ─── Submit Solution ──────────────────────────────────────────────────────────

export const submitChallenge = async (slug: string, userId: string, data: {
  language: string;
  code: string;
}) => {
  // Admin cache is keyed by ID; resolve via student cache (keyed by slug).
  // Two Redis reads at ~1ms each — far cheaper than a DB query with JOIN.
  const studentCached = await getCachedStudentChallenge(slug);
  const cached = studentCached ? await getCachedAdminChallenge(studentCached.id) : null;

  let challenge: { id: string; timeLimit: number; functionParams: unknown; returnType: string | null; testCases: { input: string; expectedOutput: string; isHidden: boolean; orderIndex: number }[] };

  if (cached && cached.status === 'published') {
    challenge = cached;
  } else {
    const dbChallenge = await prisma.challenge.findFirst({
      where: { slug, status: 'published' },
      include: { testCases: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!dbChallenge) throw notFound('Challenge not found');
    // Populate cache for next time
    await buildAndCacheChallenge(dbChallenge.id);
    challenge = dbChallenge;
  }

  if (!challenge) throw notFound('Challenge not found');

  const executorResult = await executeChallengeSubmission({
    language:       data.language,
    code:           data.code,
    testCases:      challenge.testCases,
    timeLimit:      challenge.timeLimit,
    functionParams: challenge.functionParams as unknown as FunctionParam[] | undefined,
    returnType:     challenge.returnType ?? undefined,
  });

  // Save submission
  const submission = await prisma.challengeSubmission.create({
    data: {
      userId,
      challengeId: challenge.id,
      language:    data.language,
      code:        data.code,
      status:      executorResult.status as SubmissionStatus,
      testsPassed: executorResult.testsPassed,
      totalTests:  executorResult.totalTests,
    },
  });

  // Mark as completed if all tests pass
  if (executorResult.status === 'accepted') {
    await prisma.challengeProgress.upsert({
      where:  { userId_challengeId: { userId, challengeId: challenge.id } },
      create: { userId, challengeId: challenge.id },
      update: {},
    });
  }

  // Return results — hide hidden test case I/O on failure
  const results = formatChallengeResults(executorResult, challenge.testCases);

  return {
    submissionId:  submission.id,
    status:        executorResult.status,
    testsPassed:   executorResult.testsPassed,
    totalTests:    executorResult.totalTests,
    compileError:  executorResult.compileError ?? null,
    results,
  };
};

// ─── Submission History ───────────────────────────────────────────────────────

export const getMySubmissions = async (slug: string, userId: string) => {
  const challenge = await prisma.challenge.findFirst({
    where: { slug, status: 'published' },
    select: { id: true },
  });
  if (!challenge) throw notFound('Challenge not found');

  const submissions = await prisma.challengeSubmission.findMany({
    where:   { userId, challengeId: challenge.id },
    orderBy: { submittedAt: 'desc' },
    take:    20,
    select: {
      id:          true,
      language:    true,
      status:      true,
      testsPassed: true,
      totalTests:  true,
      submittedAt: true,
    },
  });

  return submissions;
};
