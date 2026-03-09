import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db/prisma';
import { badRequest, notFound } from '../../utils/errors';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../../services/storage.service';

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const uniqueSlug = async (title: string) => {
  const base = toSlug(title);
  const exists = await prisma.course.findUnique({ where: { slug: base } });
  if (!exists) return base;
  return `${base}-${uuidv4().slice(0, 8)}`;
};

const withThumbnailUrl = async <T extends { thumbnailKey: string | null }>(course: T) => {
  if (!course.thumbnailKey) return { ...course, thumbnailUrl: null };
  return { ...course, thumbnailUrl: await getSignedUrl(course.thumbnailKey) };
};

export const createCourse = async (data: { title: string; description?: string; userId: string }) => {
  const slug = await uniqueSlug(data.title);
  return prisma.course.create({
    data: { title: data.title, slug, description: data.description, createdById: data.userId },
  });
};

export const listCourses = async ({ page, limit, isPublished }: { page: number; limit: number; isPublished?: boolean }) => {
  const where = isPublished !== undefined ? { isPublished } : {};
  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    }),
  ]);
  const coursesWithUrls = await Promise.all(courses.map(withThumbnailUrl));
  return { total, page, limit, courses: coursesWithUrls };
};

export const getCourse = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: { blocks: { orderBy: { orderIndex: 'asc' } } },
      },
      quiz: { include: { questions: { orderBy: { orderIndex: 'asc' }, include: { options: { orderBy: { orderIndex: 'asc' } } } } } },
    },
  });
  if (!course) throw notFound('Course not found');
  return withThumbnailUrl(course);
};

export const updateCourse = async (id: string, data: { title?: string; description?: string }) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound('Course not found');
  const update: Record<string, unknown> = { ...data };
  if (data.title) update.slug = await uniqueSlug(data.title);
  return prisma.course.update({ where: { id }, data: update });
};

export const deleteCourse = async (id: string) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound('Course not found');
  await prisma.course.delete({ where: { id } });
};

export const publishCourse = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: { include: { blocks: true } } },
  });
  if (!course) throw notFound('Course not found');
  if (course.modules.length === 0) throw badRequest('Cannot publish a course with no modules');
  const emptyModule = course.modules.find(m => m.blocks.length === 0);
  if (emptyModule) throw badRequest(`Module "${emptyModule.title}" has no blocks`);
  return prisma.course.update({ where: { id }, data: { isPublished: true } });
};

export const unpublishCourse = async (id: string) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound('Course not found');
  return prisma.course.update({ where: { id }, data: { isPublished: false } });
};

export const uploadThumbnail = async (id: string, file: Express.Multer.File) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound('Course not found');
  if (course.thumbnailKey) await deleteFromS3(course.thumbnailKey);
  const storageKey = await uploadToS3(file, 'thumbnails');
  await prisma.course.update({ where: { id }, data: { thumbnailKey: storageKey } });
  const url = await getSignedUrl(storageKey);
  return { storageKey, url };
};
