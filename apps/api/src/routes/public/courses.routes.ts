import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

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

export default router;
