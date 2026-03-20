import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest, notFound } from '../../utils/errors';
import * as enrollmentsService from './enrollments.service';

const listQuerySchema = z.object({
  search: z.string().optional(),
  courseId: z.string().optional(),
});

const router = Router();

router.get('/admin/enrollments', asyncHandler(async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest('Invalid query parameters');
  const enrollments = await enrollmentsService.listEnrollments(parsed.data);
  sendSuccess(res, enrollments);
}));

router.get('/admin/enrollments/:id/progress', asyncHandler(async (req, res) => {
  const progress = await enrollmentsService.getEnrollmentProgress(req.params.id);
  if (!progress) throw notFound('Enrollment not found');
  sendSuccess(res, progress);
}));

export default router;
