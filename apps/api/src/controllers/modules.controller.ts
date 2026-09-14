import { Request, Response } from 'express';
import * as service from '../routes/admin/modules.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const postAddModule = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addModule(req.params.courseId, req.body);
  sendSuccess(res, result, 'Module added', 201);
});

export const getListModules = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listModules(req.params.courseId);
  sendSuccess(res, result);
});

export const getOneModule = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getModule(req.params.id);
  sendSuccess(res, result);
});

export const patchUpdateModule = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateModule(req.params.id, req.body.title);
  sendSuccess(res, result, 'Module updated');
});

export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteModule(req.params.id);
  sendSuccess(res, undefined, 'Module deleted');
});

export const postReorderModules = asyncHandler(async (req: Request, res: Response) => {
  await service.reorderModules(req.params.courseId, req.body.items);
  sendSuccess(res, undefined, 'Modules reordered');
});
