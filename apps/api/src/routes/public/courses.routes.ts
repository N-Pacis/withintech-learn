import { Router, Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import { getSignedUrl } from '../../services/storage.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { notFound } from '../../utils/errors';

const router = Router();

router.get('/public/courses', asyncHandler(async (_req: Request, res: Response) => {
  const courseSelect = {
    id: true,
    title: true,
    slug: true,
    description: true,
    thumbnailKey: true,
    status: true,
    createdAt: true,
    _count: { select: { enrollments: true } },
  } as const;

  const allCourses = await prisma.course.findMany({
    where: { status: 'published' },
    select: courseSelect,
  });

  const chosen: typeof allCourses = [];
  const remaining = [...allCourses];

  // 1. Most enrolled
  const mostEnrolled = remaining.reduce((best, c) =>
    c._count.enrollments > (best?._count.enrollments ?? -1) ? c : best,
    remaining[0] ?? null,
  );
  if (mostEnrolled) {
    chosen.push(mostEnrolled);
    remaining.splice(remaining.indexOf(mostEnrolled), 1);
  }

  // 2. Latest course (not already chosen)
  const latest = remaining.reduce((best, c) =>
    !best || c.createdAt > best.createdAt ? c : best,
    remaining[0] ?? null,
  );
  if (latest) {
    chosen.push(latest);
    remaining.splice(remaining.indexOf(latest), 1);
  }

  // 3. Random from the rest
  if (remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    chosen.push(remaining[randomIndex]);
  }

  const tags: ('popular' | 'new' | null)[] = ['popular', 'new', null];

  const coursesWithUrls = await Promise.all(
    chosen.map(async ({ _count: _c, ...c }, i) => ({
      ...c,
      tag: tags[i] ?? null,
      thumbnailUrl: c.thumbnailKey ? await getSignedUrl(c.thumbnailKey) : null,
    })),
  );

  sendSuccess(res, coursesWithUrls);
}));

// ─── List all published courses (no auth) ────────────────────────────────────
// Must be registered before /:slug so "all" isn't matched as a slug param.

router.get('/public/courses/all', asyncHandler(async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where:   { status: 'published' },
    orderBy: { createdAt: 'desc' },
    select: {
      id:          true,
      title:       true,
      slug:        true,
      description: true,
      thumbnailKey: true,
      createdAt:   true,
      _count:      { select: { modules: true } },
    },
  });

  const coursesWithUrls = await Promise.all(
    courses.map(async ({ _count, ...c }) => ({
      ...c,
      thumbnailUrl:  c.thumbnailKey ? await getSignedUrl(c.thumbnailKey) : null,
      moduleCount:   _count.modules,
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
