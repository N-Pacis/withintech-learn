import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getCertificate } from './certificates.service';

const router = Router();

// Public — no auth required (certificates are publicly verifiable)
router.get('/certificates/:userId/:courseSlug', asyncHandler(async (req: Request, res: Response) => {
  const result = await getCertificate(req.params.userId, req.params.courseSlug);
  sendSuccess(res, result);
}));

export default router;
