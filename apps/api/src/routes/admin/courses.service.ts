import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../utils/errors";
import {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
} from "../../services/storage.service";
import {
  buildAndCacheCourse,
  invalidateCourseCache,
} from "../../services/course-cache.service";

const toSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const uniqueSlug = (title: string) => `${toSlug(title)}-${Date.now()}`;

const withThumbnailUrl = async <T extends { thumbnailKey: string | null }>(
  course: T,
) => {
  if (!course.thumbnailKey) return { ...course, thumbnailUrl: null };
  return { ...course, thumbnailUrl: await getSignedUrl(course.thumbnailKey) };
};

export const createCourse = async (data: {
  title: string;
  description?: string;
  userId: string;
  accessType?: 'FREE' | 'PAID_COURSE' | 'PAID_CERTIFICATE';
  price?: number;
  certificatePrice?: number;
}) => {
  const slug = uniqueSlug(data.title);
  return prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      createdById: data.userId,
      accessType: data.accessType ?? 'FREE',
      price: data.accessType === 'PAID_COURSE' ? data.price : null,
      certificatePrice: data.accessType === 'PAID_CERTIFICATE' ? data.certificatePrice : null,
    },
  });
};

export const listCourses = async ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const where = status
    ? { status: status as "draft" | "published" | "archived" }
    : {};
  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
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
      quiz: {
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: { options: { orderBy: { orderIndex: "asc" } } },
          },
        },
      },
    },
  });
  if (!course) throw notFound("Course not found");
  return withThumbnailUrl(course);
};

export const updateCourse = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    accessType?: 'FREE' | 'PAID_COURSE' | 'PAID_CERTIFICATE';
    price?: number;
    certificatePrice?: number;
  },
) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "draft")
    throw badRequest("Only draft courses can be edited");
  const update: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    accessType: data.accessType,
  };
  if (data.title) update.slug = uniqueSlug(data.title);
  if (data.accessType === 'PAID_COURSE') {
    update.price = data.price ?? null;
    update.certificatePrice = null;
  } else if (data.accessType === 'PAID_CERTIFICATE') {
    update.certificatePrice = data.certificatePrice ?? null;
    update.price = null;
  } else if (data.accessType === 'FREE') {
    update.price = null;
    update.certificatePrice = null;
  }
  return prisma.course.update({ where: { id }, data: update });
};

export const deleteCourse = async (id: string) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound("Course not found");
  await prisma.course.delete({ where: { id } });
};

export const publishCourse = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: { include: { lessons: true } },
    },
  });
  if (!course) throw notFound("Course not found");
  if (course.status !== "draft")
    throw badRequest("Only draft courses can be published");
  if (course.modules.length === 0)
    throw badRequest("Cannot publish a course with no modules");
  const emptyModule = course.modules.find((m) => m.lessons.length === 0);
  if (emptyModule)
    throw badRequest(`Module "${emptyModule.title}" has no lessons`);
  const updated = await prisma.course.update({
    where: { id },
    data: { status: "published" },
  });
  await buildAndCacheCourse(id);
  return updated;
};

export const archiveCourse = async (id: string) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "published")
    throw badRequest("Only published courses can be archived");
  const updated = await prisma.course.update({
    where: { id },
    data: { status: "archived" },
  });
  await invalidateCourseCache(course.slug);
  return updated;
};

export const unarchiveCourse = async (id: string) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "archived")
    throw badRequest("Only archived courses can be unarchived");
  const updated = await prisma.course.update({
    where: { id },
    data: { status: "published" },
  });
  await buildAndCacheCourse(id);
  return updated;
};

export const uploadThumbnail = async (
  id: string,
  file: Express.Multer.File,
) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw notFound("Course not found");
  if (course.status !== "draft")
    throw badRequest("Only draft courses can be modified");
  if (course.thumbnailKey) await deleteFromS3(course.thumbnailKey);
  const storageKey = await uploadToS3(file, "thumbnails");
  await prisma.course.update({
    where: { id },
    data: { thumbnailKey: storageKey },
  });
  const url = await getSignedUrl(storageKey);
  return { storageKey, url };
};
