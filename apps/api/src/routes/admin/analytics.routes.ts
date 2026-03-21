import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { enrollmentTrend, topCourses, retention } from './analytics.service';

const MONTH_RE = /^\d{4}-\d{2}$/;

const trendQuerySchema = z.object({
  from: z.string().regex(MONTH_RE, 'from must be YYYY-MM'),
  to:   z.string().regex(MONTH_RE, 'to must be YYYY-MM'),
}).refine((d) => d.from <= d.to, { message: 'from must be ≤ to' });

const router = Router();

router.get('/admin/analytics/enrollment-trend', asyncHandler(async (req, res) => {
  const parsed = trendQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Invalid params');
  sendSuccess(res, await enrollmentTrend(parsed.data.from, parsed.data.to));
}));

router.get('/admin/analytics/top-courses', asyncHandler(async (_req, res) => {
  sendSuccess(res, await topCourses(5));
}));

router.get('/admin/analytics/retention', asyncHandler(async (_req, res) => {
  sendSuccess(res, await retention());
}));

export default router;
