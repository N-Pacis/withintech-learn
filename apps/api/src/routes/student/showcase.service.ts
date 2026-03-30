import { prisma } from '../../db/prisma';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../../services/storage.service';
import { badRequest, forbidden, notFound } from '../../utils/errors';
import { withUrls } from '../showcase.utils';
import type { CreateShowcaseInput } from './showcase.schemas';

const normalizeUrl = (val: string | null | undefined): string | null => {
  if (!val || val.trim() === '') return null;
  return val.trim();
};

const projectInclude = {
  categories: true,
  images: { orderBy: { orderIndex: 'asc' as const } },
  techTags: true,
  aiTools: true,
  _count: { select: { likes: true } },
};

// ─── Student CRUD ─────────────────────────────────────────────────────────────

export const createShowcaseProject = async (
  userId: string,
  data: CreateShowcaseInput,
) => {
  const { techTags = [], aiTools = [], categories = [], ...fields } = data;

  const project = await prisma.showcaseProject.create({
    data: {
      authorId: userId,
      title: fields.title,
      description: fields.description ?? null,
      problemStatement: fields.problemStatement,
      githubUrl: normalizeUrl(fields.githubUrl),
      demoUrl: normalizeUrl(fields.demoUrl),
      aiUsageDescription: fields.aiUsageDescription ?? null,
      categories: { createMany: { data: categories.map((category) => ({ category })) } },
      techTags: { createMany: { data: techTags.map((name) => ({ name })) } },
      aiTools:  { createMany: { data: aiTools.map((name)  => ({ name })) } },
    },
    include: projectInclude,
  });

  return withUrls(project);
};

export const listOwnShowcaseProjects = async (
  userId: string,
  { page, limit, status }: { page: number; limit: number; status?: string },
) => {
  const where = {
    authorId: userId,
    ...(status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' } : {}),
  };

  const [total, projects] = await Promise.all([
    prisma.showcaseProject.count({ where }),
    prisma.showcaseProject.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const hydratedProjects = await Promise.all(projects.map(withUrls));

  return { total, page, limit, projects: hydratedProjects };
};

export const getOwnShowcaseProject = async (userId: string, projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    include: { ...projectInclude, author: { select: { firstName: true, lastName: true } } },
  });

  if (!project) throw notFound('Project not found');
  if (project.authorId !== userId) throw forbidden('Not your project');

  return withUrls(project);
};

export const archiveOwnShowcaseProject = async (userId: string, projectId: string) => {
  const existing = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { authorId: true, status: true },
  });

  if (!existing) throw notFound('Project not found');
  if (existing.authorId !== userId) throw forbidden('Not your project');
  if (existing.status === 'ARCHIVED') throw badRequest('Project is already archived');

  return prisma.showcaseProject.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED' },
    include: projectInclude,
  });
};

export const deleteOwnShowcaseProject = async (userId: string, projectId: string) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    include: { images: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.authorId !== userId) throw forbidden('Not your project');
  if (project.status === 'APPROVED') throw forbidden('Approved projects cannot be deleted. Archive the project instead.');

  // Delete S3 assets
  const s3Deletes: Promise<void>[] = [];
  if (project.thumbnailKey) s3Deletes.push(deleteFromS3(project.thumbnailKey));
  for (const img of project.images) s3Deletes.push(deleteFromS3(img.storageKey));
  await Promise.allSettled(s3Deletes);

  await prisma.showcaseProject.delete({ where: { id: projectId } });
};

// ─── Media ────────────────────────────────────────────────────────────────────

export const uploadShowcaseThumbnail = async (
  userId: string,
  projectId: string,
  file: Express.Multer.File,
) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { authorId: true, thumbnailKey: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.authorId !== userId) throw forbidden('Not your project');

  if (project.thumbnailKey) {
    await deleteFromS3(project.thumbnailKey).catch(() => null);
  }

  const storageKey = await uploadToS3(file, 'showcase/thumbnails');
  await prisma.showcaseProject.update({
    where: { id: projectId },
    data: { thumbnailKey: storageKey },
  });

  return { thumbnailUrl: await getSignedUrl(storageKey) };
};

export const addGalleryImage = async (
  userId: string,
  projectId: string,
  file: Express.Multer.File,
) => {
  const imageRecord = await prisma.$transaction(async (tx) => {
    const project = await tx.showcaseProject.findUnique({
      where: { id: projectId },
      include: { _count: { select: { images: true } } },
    });

    if (!project) throw notFound('Project not found');
    if (project.authorId !== userId) throw forbidden('Not your project');
    if (project._count.images >= 10) throw badRequest('Maximum 10 gallery images allowed per project');

    const storageKey = await uploadToS3(file, 'showcase/images');
    return tx.showcaseImage.create({
      data: { projectId, storageKey, orderIndex: project._count.images },
    });
  });

  return {
    ...imageRecord,
    imageUrl: await getSignedUrl(imageRecord.storageKey),
  };
};

export const deleteGalleryImage = async (
  userId: string,
  projectId: string,
  imageId: string,
) => {
  const project = await prisma.showcaseProject.findUnique({
    where: { id: projectId },
    select: { authorId: true },
  });

  if (!project) throw notFound('Project not found');
  if (project.authorId !== userId) throw forbidden('Not your project');

  const image = await prisma.showcaseImage.findUnique({
    where: { id: imageId },
    select: { projectId: true, storageKey: true },
  });

  if (!image || image.projectId !== projectId) throw notFound('Image not found');

  await prisma.$transaction(async (tx) => {
    await tx.showcaseImage.delete({ where: { id: imageId } });

    // Re-number remaining images to keep orderIndex contiguous (0-based)
    const remaining = await tx.showcaseImage.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    await Promise.all(
      remaining.map((img, i) =>
        tx.showcaseImage.update({ where: { id: img.id }, data: { orderIndex: i } }),
      ),
    );
  });

  await deleteFromS3(image.storageKey).catch(() => null);
};
