import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getCertificate, listStudentCertificates } from './certificates.service';

const router = Router();

// Authenticated — list current user's certificates
router.get('/student/certificates', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const result = await listStudentCertificates(req.user!.userId);
  sendSuccess(res, result);
}));

// Public — no auth required (certificates are publicly verifiable)
router.get('/certificates/:userId/:courseSlug', asyncHandler(async (req: Request, res: Response) => {
  const result = await getCertificate(req.params.userId, req.params.courseSlug);
  sendSuccess(res, result);
}));

export default router;
