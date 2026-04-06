import redis from '../db/redis';
import { prisma } from '../db/prisma';

// ─── Key helpers ──────────────────────────────────────────────────────────────

const adminKey   = (id: string)   => `admin_challenge:${id}`;
const studentKey = (slug: string) => `student_challenge:${slug}`;

const TTL = 60 * 60 * 24; // 24 h — safety net; invalidation is explicit

// ─── Cached shapes ────────────────────────────────────────────────────────────

// Mirrors the shape returned by getChallenge() in admin challenges.service.ts
export interface CachedAdminChallenge {
  id:             string;
  title:          string;
  slug:           string;
  description:    string;
  difficulty:     string;
  status:         string;
  starterCode:    unknown;
  functionParams: unknown;
  returnType:     string | null;
  timeLimit:      number;
  orderIndex:     number;
  createdAt:      string;
  updatedAt:      string;
  createdBy:      { id: string; firstName: string; lastName: string };
  _count:         { submissions: number };
  testCases: {
    id:             string;
    challengeId:    string;
    input:          string;
    expectedOutput: string;
    isHidden:       boolean;
    orderIndex:     number;
  }[];
}

// Mirrors the static part of getPublishedChallenge() (no per-user fields)
export interface CachedStudentChallenge {
  id:             string;
  title:          string;
  slug:           string;
  description:    string;
  difficulty:     string;
  starterCode:    unknown;
  functionParams: unknown;
  returnType:     string | null;
  timeLimit:      number;
  visibleTestCases: {
    id:             string;
    input:          string;
    expectedOutput: string;
    orderIndex:     number;
  }[];
}

// ─── Build & store ────────────────────────────────────────────────────────────

export const buildAndCacheChallenge = async (id: string): Promise<void> => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      testCases:  { orderBy: { orderIndex: 'asc' } },
      createdBy:  { select: { id: true, firstName: true, lastName: true } },
      _count:     { select: { submissions: true } },
    },
  });
  if (!challenge) return;

  const pipeline = redis.pipeline();

  // Admin cache — full detail
  const adminPayload: CachedAdminChallenge = {
    id:             challenge.id,
    title:          challenge.title,
    slug:           challenge.slug,
    description:    challenge.description,
    difficulty:     challenge.difficulty,
    status:         challenge.status,
    starterCode:    challenge.starterCode,
    functionParams: challenge.functionParams,
    returnType:     challenge.returnType,
    timeLimit:      challenge.timeLimit,
    orderIndex:     challenge.orderIndex,
    createdAt:      challenge.createdAt.toISOString(),
    updatedAt:      challenge.updatedAt.toISOString(),
    createdBy:      challenge.createdBy,
    _count:         { submissions: challenge._count.submissions },
    testCases:      challenge.testCases.map(tc => ({
      id:             tc.id,
      challengeId:    tc.challengeId,
      input:          tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden:       tc.isHidden,
      orderIndex:     tc.orderIndex,
    })),
  };
  pipeline.set(adminKey(id), JSON.stringify(adminPayload), 'EX', TTL);

  // Student cache — only cache published challenges with visible test cases only
  if (challenge.status === 'published') {
    const studentPayload: CachedStudentChallenge = {
      id:             challenge.id,
      title:          challenge.title,
      slug:           challenge.slug,
      description:    challenge.description,
      difficulty:     challenge.difficulty,
      starterCode:    challenge.starterCode,
      functionParams: challenge.functionParams,
      returnType:     challenge.returnType,
      timeLimit:      challenge.timeLimit,
      visibleTestCases: challenge.testCases
        .filter(tc => !tc.isHidden)
        .map(tc => ({
          id:             tc.id,
          input:          tc.input,
          expectedOutput: tc.expectedOutput,
          orderIndex:     tc.orderIndex,
        })),
    };
    pipeline.set(studentKey(challenge.slug), JSON.stringify(studentPayload), 'EX', TTL);
  }

  await pipeline.exec();
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getCachedAdminChallenge = async (id: string): Promise<CachedAdminChallenge | null> => {
  const raw = await redis.get(adminKey(id));
  return raw ? (JSON.parse(raw) as CachedAdminChallenge) : null;
};

export const getCachedStudentChallenge = async (slug: string): Promise<CachedStudentChallenge | null> => {
  const raw = await redis.get(studentKey(slug));
  return raw ? (JSON.parse(raw) as CachedStudentChallenge) : null;
};

// ─── Invalidate ───────────────────────────────────────────────────────────────

// Deletes both admin and student keys for a challenge.
// Pass slug when known (e.g. after unpublish) to also clear the student key.
export const invalidateChallengeCache = async (id: string, slug?: string): Promise<void> => {
  const pipeline = redis.pipeline();
  pipeline.del(adminKey(id));
  if (slug) pipeline.del(studentKey(slug));
  await pipeline.exec();
};
