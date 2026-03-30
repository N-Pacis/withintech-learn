import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { CHALLENGE_CATEGORIES } from '../student/showcase.schemas';
import * as svc from './showcase.service';

const router = Router();

const listPublicSchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(50).default(20),
  category: z.enum(CHALLENGE_CATEGORIES).optional(),
  search:   z.string().optional(),
  sort:     z.enum(['newest', 'oldest', 'mostLiked']).default('newest'),
});

router.get(
  '/public/showcase',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = listPublicSchema.safeParse(req.query);
    if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
    const result = await svc.listPublicShowcaseProjects(parsed.data);
    sendSuccess(res, result);
  }),
);

router.get(
  '/public/showcase/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.getPublicShowcaseProject(req.params.id, req.user?.userId);
    sendSuccess(res, result);
  }),
);

// Like toggle — requires authenticate middleware applied in routes/index.ts
router.post(
  '/showcase/:id/like',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.toggleLike(req.user!.userId, req.params.id);
    sendSuccess(res, result);
  }),
);

export default router;
