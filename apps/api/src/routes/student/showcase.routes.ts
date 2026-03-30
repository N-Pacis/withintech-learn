import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { validate } from '../../middleware/validate.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { badRequest } from '../../utils/errors';
import {
  createShowcaseSchema,
  listStudentShowcaseSchema,
} from './showcase.schemas';
import * as svc from './showcase.service';

const router = Router();

router.get(
  '/student/showcase',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = listStudentShowcaseSchema.safeParse(req.query);
    if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
    const result = await svc.listOwnShowcaseProjects(req.user!.userId, parsed.data);
    sendSuccess(res, result);
  }),
);

router.post(
  '/student/showcase',
  validate(createShowcaseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.createShowcaseProject(req.user!.userId, req.body);
    sendSuccess(res, result, 'Project submitted for review', 201);
  }),
);

router.get(
  '/student/showcase/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.getOwnShowcaseProject(req.user!.userId, req.params.id);
    sendSuccess(res, result);
  }),
);

router.patch(
  '/student/showcase/:id/archive',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.archiveOwnShowcaseProject(req.user!.userId, req.params.id);
    sendSuccess(res, result, 'Project archived');
  }),
);

router.delete(
  '/student/showcase/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await svc.deleteOwnShowcaseProject(req.user!.userId, req.params.id);
    sendSuccess(res, undefined, 'Project deleted');
  }),
);

router.post(
  '/student/showcase/:id/upload-thumbnail',
  uploadImage,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw badRequest('Image file required');
    const result = await svc.uploadShowcaseThumbnail(req.user!.userId, req.params.id, req.file);
    sendSuccess(res, result, 'Thumbnail uploaded');
  }),
);

router.post(
  '/student/showcase/:id/upload-image',
  uploadImage,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw badRequest('Image file required');
    const result = await svc.addGalleryImage(req.user!.userId, req.params.id, req.file);
    sendSuccess(res, result, 'Image added', 201);
  }),
);

router.delete(
  '/student/showcase/:id/images/:imageId',
  asyncHandler(async (req: Request, res: Response) => {
    await svc.deleteGalleryImage(req.user!.userId, req.params.id, req.params.imageId);
    sendSuccess(res, undefined, 'Image removed');
  }),
);

export default router;
