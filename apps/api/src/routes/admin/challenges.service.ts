import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../utils/errors';

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const uniqueSlug = (title: string) =>
  `${toSlug(title)}-${Date.now()}`;

// ─── Challenges ───────────────────────────────────────────────────────────────

export const createChallenge = async (data: {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: object;
  timeLimit: number;
  orderIndex: number;
  userId: string;
}) => {
  const slug = uniqueSlug(data.title);
  return prisma.challenge.create({
    data: {
      title:       data.title,
      slug,
      description: data.description,
      difficulty:  data.difficulty,
      starterCode: data.starterCode,
      timeLimit:   data.timeLimit,
      orderIndex:  data.orderIndex,
      createdById: data.userId,
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
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      testCases:  { orderBy: { orderIndex: 'asc' } },
      createdBy:  { select: { id: true, firstName: true, lastName: true } },
      _count:     { select: { submissions: true } },
    },
  });
  if (!challenge) throw notFound('Challenge not found');
  return challenge;
};

export const updateChallenge = async (id: string, data: {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  starterCode?: object;
  timeLimit?: number;
  orderIndex?: number;
}) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'published' && data.title !== undefined)
    throw badRequest('Title cannot be changed after publishing. Unpublish first.');

  return prisma.challenge.update({ where: { id }, data });
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

  return prisma.challenge.update({ where: { id }, data: { status: 'published' } });
};

export const unpublishChallenge = async (id: string) => {
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) throw notFound('Challenge not found');
  if (challenge.status === 'draft') throw conflict('Challenge is already unpublished');
  return prisma.challenge.update({ where: { id }, data: { status: 'draft' } });
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

  // Shift existing test cases if orderIndex is taken
  const existing = await prisma.challengeTestCase.findFirst({
    where: { challengeId, orderIndex: data.orderIndex },
  });
  if (existing) {
    await prisma.challengeTestCase.updateMany({
      where: { challengeId, orderIndex: { gte: data.orderIndex } },
      data: { orderIndex: { increment: 1 } },
    });
  }

  return prisma.challengeTestCase.create({
    data: { challengeId, ...data },
  });
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
};
