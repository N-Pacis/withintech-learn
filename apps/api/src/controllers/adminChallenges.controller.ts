import { Request, Response } from 'express';
import * as service from '../routes/admin/challenges.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';
import { listChallengesSchema } from '../routes/admin/challenges.schemas';

export const postCreateChallenge = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.createChallenge({ ...req.body, userId: req.user!.userId });
  sendSuccess(res, result, 'Challenge created', 201);
});

export const getListChallenges = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listChallengesSchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await service.listChallenges(parsed.data);
  sendSuccess(res, result);
});

export const getOneChallenge = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getChallenge(req.params.id);
  sendSuccess(res, result);
});

export const patchUpdateChallenge = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateChallenge(req.params.id, req.body);
  sendSuccess(res, result, 'Challenge updated');
});

export const deleteChallenge = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteChallenge(req.params.id);
  sendSuccess(res, undefined, 'Challenge deleted');
});

export const patchPublishChallenge = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.publishChallenge(req.params.id);
  sendSuccess(res, result, 'Challenge published');
});

export const patchUnpublishChallenge = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.unpublishChallenge(req.params.id);
  sendSuccess(res, result, 'Challenge unpublished');
});

export const postAddTestCase = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addTestCase(req.params.id, req.body);
  sendSuccess(res, result, 'Test case added', 201);
});

export const patchUpdateTestCase = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateTestCase(req.params.testCaseId, req.body);
  sendSuccess(res, result, 'Test case updated');
});

export const deleteTestCase = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteTestCase(req.params.testCaseId);
  sendSuccess(res, undefined, 'Test case deleted');
});
