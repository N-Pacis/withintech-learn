import { prisma } from '../../db/prisma';
import { deleteFromS3 } from '../../services/storage.service';
import { notFound, badRequest } from '../../utils/errors';
import { withUrls } from '../showcase.utils';
import type { ShowcaseStatus, ChallengeCategory } from '@prisma/client';

const projectAdminInclude = {
  author: { select: { firstName: true, lastName: true, email: true } },
  categories: true,
  images: { orderBy: { orderIndex: 'asc' as const } },
  techTags: true,
  aiTools: true,
  _count: { select: { likes: true } },
};

export const listAllShowcaseProjects = async ({
  page,
  limit,
  status,
  category,
  search,
}: {
  page: number;
  limit: number;
  status?: ShowcaseStatus;
  category?: string;
  search?: string;
}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { categories: { some: { category: category as ChallengeCategory } } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { author: { firstName: { contains: search, mode: 'insensitive' as const } } },
            { author: { lastName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [total, projects] = await Promise.all([
    prisma.showcaseProject.count({ where }),
    prisma.showcaseProject.findMany({
      where,
      include: projectAdminInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const hydratedProjects = await Promise.all(projects.map(withUrls));
  return { total, page, limit, projects: hydratedProjects };
};

export const getShowcaseProjectAdmin = async (projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    include: projectAdminInclude,
  });

  if (!project) throw notFound('Project not found');
  return withUrls(project);
};

export const approveShowcaseProject = async (projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.status !== 'PENDING') throw badRequest('Only pending projects can be approved');

  return prisma.showcaseProject.update({
    where: { id: projectId },
    data: { status: 'APPROVED', rejectionReason: null },
    include: projectAdminInclude,
  });
};

export const rejectShowcaseProject = async (projectId: string, reason: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.status !== 'PENDING') throw badRequest('Only pending projects can be rejected');

  return prisma.showcaseProject.update({
    where: { id: projectId },
    data: { status: 'REJECTED', rejectionReason: reason },
    include: projectAdminInclude,
  });
};

export const toggleFeatured = async (projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { status: true, featuredAt: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.status !== 'APPROVED') throw badRequest('Only approved projects can be featured');

  return prisma.showcaseProject.update({
    where: { id: projectId },
    data: { featuredAt: project.featuredAt ? null : new Date() },
    include: projectAdminInclude,
  });
};

export const archiveShowcaseProject = async (projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.status === 'ARCHIVED') throw badRequest('Project is already archived');

  return prisma.showcaseProject.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED' },
    include: projectAdminInclude,
  });
};

export const adminDeleteShowcaseProject = async (projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    include: { images: true },
  });

  if (!project) throw notFound('Project not found');

  const s3Deletes: Promise<void>[] = [];
  if (project.thumbnailKey) s3Deletes.push(deleteFromS3(project.thumbnailKey));
  for (const img of project.images) s3Deletes.push(deleteFromS3(img.storageKey));
  await Promise.allSettled(s3Deletes);

  await prisma.showcaseProject.delete({ where: { id: projectId } });
};
