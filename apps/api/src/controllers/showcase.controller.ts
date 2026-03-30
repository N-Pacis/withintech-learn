import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { badRequest } from '../utils/errors';
import { adminListShowcaseSchema, rejectShowcaseSchema } from '../routes/admin/showcase.schemas';
import * as adminSvc from '../routes/admin/showcase.service';

export const getAdminListShowcase = asyncHandler(async (req: Request, res: Response) => {
  const parsed = adminListShowcaseSchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await adminSvc.listAllShowcaseProjects(parsed.data);
  sendSuccess(res, result);
});

export const getAdminShowcaseDetail = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminSvc.getShowcaseProjectAdmin(req.params.id);
  sendSuccess(res, result);
});

export const patchApproveShowcase = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminSvc.approveShowcaseProject(req.params.id);
  sendSuccess(res, result, 'Project approved');
});

export const patchRejectShowcase = asyncHandler(async (req: Request, res: Response) => {
  const parsed = rejectShowcaseSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Reason is required');
  const result = await adminSvc.rejectShowcaseProject(req.params.id, parsed.data.reason);
  sendSuccess(res, result, 'Project rejected');
});

export const patchFeatureShowcase = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminSvc.toggleFeatured(req.params.id);
  sendSuccess(res, result, 'Featured status toggled');
});

export const patchArchiveShowcase = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminSvc.archiveShowcaseProject(req.params.id);
  sendSuccess(res, result, 'Project archived');
});

export const deleteAdminShowcase = asyncHandler(async (req: Request, res: Response) => {
  await adminSvc.adminDeleteShowcaseProject(req.params.id);
  sendSuccess(res, undefined, 'Project deleted');
});
