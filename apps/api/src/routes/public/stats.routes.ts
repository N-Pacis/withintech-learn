import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getPublicStats } from './stats.service';

const router = Router();

router.get('/public/stats', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await getPublicStats());
}));

export default router;
