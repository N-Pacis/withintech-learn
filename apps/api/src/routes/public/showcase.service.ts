import { prisma } from '../../db/prisma';
import { badRequest, notFound } from '../../utils/errors';
import { withUrls } from '../showcase.utils';
import type { ChallengeCategory } from '@prisma/client';

const projectPublicInclude = {
  author: { select: { firstName: true, lastName: true } },
  categories: true,
  images: { orderBy: { orderIndex: 'asc' as const } },
  techTags: true,
  aiTools: true,
  _count: { select: { likes: true } },
};

// ─── Public list ──────────────────────────────────────────────────────────────

export const listPublicShowcaseProjects = async ({
  page = 1,
  limit = 20,
  category,
  search,
  sort = 'newest',
}: {
  page?: number;
  limit?: number;
  category?: ChallengeCategory;
  search?: string;
  sort?: 'newest' | 'oldest' | 'mostLiked';
}) => {
  const where = {
    status: 'APPROVED' as const,
    ...(category ? { categories: { some: { category } } } : {}),
    ...(search
      ? {
          OR: [
            { title:              { contains: search, mode: 'insensitive' as const } },
            { description:        { contains: search, mode: 'insensitive' as const } },
            { problemStatement:   { contains: search, mode: 'insensitive' as const } },
            { aiUsageDescription: { contains: search, mode: 'insensitive' as const } },
            { techTags: { some: { name: { contains: search, mode: 'insensitive' as const } } } },
            { aiTools:  { some: { name: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBy: any[] =
    sort === 'mostLiked' ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
    : sort === 'oldest'  ? [{ createdAt: 'asc' }]
    :                      [{ featuredAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];

  const [total, projects] = await Promise.all([
    prisma.showcaseProject.count({ where }),
    prisma.showcaseProject.findMany({
      where,
      include: projectPublicInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const hydratedProjects = await Promise.all(projects.map(withUrls));

  return { total, page, limit, projects: hydratedProjects };
};

// ─── Public detail ────────────────────────────────────────────────────────────

export const getPublicShowcaseProject = async (
  projectId: string,
  requestingUserId?: string,
) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    include: projectPublicInclude,
  });

  if (!project || project.status !== 'APPROVED') throw notFound('Project not found');

  let hasLiked = false;
  if (requestingUserId) {
    const like = await prisma.showcaseLike.findUnique({
      where: { projectId_userId: { projectId, userId: requestingUserId } },
      select: { projectId: true },
    });
    hasLiked = !!like;
  }

  const hydrated = await withUrls(project);
  return { ...hydrated, hasLiked };
};

// ─── Like toggle (idempotent) ─────────────────────────────────────────────────

export const toggleLike = async (userId: string, projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.status !== 'APPROVED') throw badRequest('Can only like approved projects');

  const existing = await prisma.showcaseLike.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (existing) {
    await prisma.showcaseLike.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  } else {
    await prisma.showcaseLike.create({ data: { projectId, userId } });
  }

  const likeCount = await prisma.showcaseLike.count({ where: { projectId } });
  return { liked: !existing, likeCount };
};
