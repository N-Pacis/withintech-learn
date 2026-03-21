import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { notFound } from '../../utils/errors';

const router = Router();

router.get('/public/courses', asyncHandler(async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailKey: true,
      status: true,
    },
  });

  const coursesWithUrls = await Promise.all(
    courses.map(async (c) => ({
      ...c,
      thumbnailUrl: c.thumbnailKey ? await getSignedUrl(c.thumbnailKey) : null,
    })),
  );

  sendSuccess(res, coursesWithUrls);
}));

router.get('/public/courses/:slug', asyncHandler(async (req: Request, res: Response) => {
  const course = await prisma.course.findFirst({
    where: { slug: req.params.slug, status: 'published' },
    select: {
      title: true,
      slug: true,
      description: true,
      thumbnailKey: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        select: { title: true, orderIndex: true },
      },
    },
  });

  if (!course) throw notFound('Course not found');

  sendSuccess(res, {
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnailUrl: course.thumbnailKey ? await getSignedUrl(course.thumbnailKey) : null,
    modules: course.modules.map((m) => m.title),
  });
}));

export default router;
