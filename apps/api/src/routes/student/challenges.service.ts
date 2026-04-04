import { SubmissionStatus } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { badRequest, notFound } from '../../utils/errors';

const EXECUTOR_URL    = process.env.EXECUTOR_URL    ?? 'http://localhost:4001';
const EXECUTOR_SECRET = process.env.EXECUTOR_SECRET ?? '';

const SUPPORTED_LANGUAGES = ['python', 'java', 'javascript', 'c', 'cpp', 'go'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

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
  const challenge = await prisma.challenge.findFirst({
    where: { slug, status: 'published' },
    include: {
      testCases: {
        where:   { isHidden: false },
        orderBy: { orderIndex: 'asc' },
        select:  { id: true, input: true, expectedOutput: true, orderIndex: true },
      },
      progress: { where: { userId }, select: { completedAt: true } },
    },
  });
  if (!challenge) throw notFound('Challenge not found');

  return {
    id:          challenge.id,
    title:       challenge.title,
    slug:        challenge.slug,
    description: challenge.description,
    difficulty:  challenge.difficulty,
    starterCode: challenge.starterCode,
    timeLimit:   challenge.timeLimit,
    visibleTestCases: challenge.testCases,
    completed:   challenge.progress.length > 0,
    completedAt: challenge.progress[0]?.completedAt ?? null,
  };
};

// ─── Submit Solution ──────────────────────────────────────────────────────────

export const submitChallenge = async (slug: string, userId: string, data: {
  language: string;
  code: string;
}) => {
  if (!SUPPORTED_LANGUAGES.includes(data.language as SupportedLanguage))
    throw badRequest(`Unsupported language: ${data.language}`);
  if (!data.code.trim())
    throw badRequest('Code cannot be empty');

  const challenge = await prisma.challenge.findFirst({
    where: { slug, status: 'published' },
    include: { testCases: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.testCases.length === 0)
    throw badRequest('This challenge has no test cases yet');

  // Call executor service
  let executorResult: ExecutorResponse;
  try {
    const response = await fetch(`${EXECUTOR_URL}/execute`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EXECUTOR_SECRET ? { 'Authorization': `Bearer ${EXECUTOR_SECRET}` } : {}),
      },
      body:    JSON.stringify({
        language:  data.language,
        code:      data.code,
        testCases: challenge.testCases.map(tc => ({
          input:          tc.input,
          expectedOutput: tc.expectedOutput,
        })),
        timeLimit: challenge.timeLimit,
      }),
    });
    if (!response.ok)
      throw new Error(`executor responded with ${response.status}`);
    executorResult = await response.json() as ExecutorResponse;
  } catch (err) {
    throw badRequest(`Execution service unavailable: ${(err as Error).message}`);
  }

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
  const results = executorResult.results.map((r, i) => {
    const tc = challenge.testCases[i];
    if (!tc) return r;
    if (tc.isHidden && executorResult.status !== 'accepted') {
      return {
        passed:         r.passed,
        input:          null,
        actualOutput:   null,
        expectedOutput: null,
        stderr:         r.stderr,
      };
    }
    return r;
  });

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

// ─── Internal types ───────────────────────────────────────────────────────────

interface ExecutorResponse {
  status:       string;
  testsPassed:  number;
  totalTests:   number;
  compileError?: string;
  results: {
    passed:         boolean;
    input:          string;
    actualOutput:   string;
    expectedOutput: string;
    stderr:         string;
  }[];
}
