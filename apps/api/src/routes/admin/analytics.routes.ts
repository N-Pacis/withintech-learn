import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { enrollmentTrend, topCourses, retention } from './analytics.service';

const router = Router();

router.get('/admin/analytics/enrollment-trend', asyncHandler(async (_req, res) => {
  sendSuccess(res, await enrollmentTrend(12));
}));

router.get('/admin/analytics/top-courses', asyncHandler(async (_req, res) => {
  sendSuccess(res, await topCourses(5));
}));

router.get('/admin/analytics/retention', asyncHandler(async (_req, res) => {
  sendSuccess(res, await retention());
}));

export default router;
