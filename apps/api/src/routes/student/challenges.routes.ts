import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { challengeSubmitLimiter } from '../../middleware/rateLimiter.middleware';
import {
  listPublishedChallenges,
  getPublishedChallenge,
  submitChallenge,
  getMySubmissions,
} from './challenges.service';

const router = Router();

const listSchema = z.object({
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().positive().max(100).default(20),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  sort:       z.enum(['number_asc', 'number_desc', 'least_solved', 'most_solved', 'oldest', 'newest']).default('number_asc'),
});

const submitSchema = z.object({
  language: z.enum(['python', 'java', 'javascript', 'c', 'cpp', 'go']),
  code:     z.string().min(1).max(65536),
});

router.get('/student/challenges', asyncHandler(async (req: Request, res: Response) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await listPublishedChallenges({ userId: req.user!.userId, ...parsed.data });
  sendSuccess(res, result);
}));

router.get('/student/challenges/:slug', asyncHandler(async (req: Request, res: Response) => {
  const result = await getPublishedChallenge(req.params.slug, req.user!.userId);
  sendSuccess(res, result);
}));

router.post(
  '/student/challenges/:slug/submit',
  challengeSubmitLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
    const result = await submitChallenge(req.params.slug, req.user!.userId, parsed.data);
    sendSuccess(res, result, 'Submission complete');
  }),
);

router.get('/student/challenges/:slug/submissions', asyncHandler(async (req: Request, res: Response) => {
  const result = await getMySubmissions(req.params.slug, req.user!.userId);
  sendSuccess(res, result);
}));

export default router;
