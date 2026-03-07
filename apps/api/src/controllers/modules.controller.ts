import { Request, Response } from 'express';
import * as service from '../routes/admin/modules.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';

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

export const postAddBlock = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addBlock(req.params.moduleId, req.body);
  sendSuccess(res, result, 'Block added', 201);
});

export const getListBlocks = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listBlocks(req.params.moduleId);
  sendSuccess(res, result);
});

export const patchUpdateBlock = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateBlock(req.params.id, req.body);
  sendSuccess(res, result, 'Block updated');
});

export const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteBlock(req.params.id);
  sendSuccess(res, undefined, 'Block deleted');
});

export const postReorderBlocks = asyncHandler(async (req: Request, res: Response) => {
  await service.reorderBlocks(req.params.moduleId, req.body.items);
  sendSuccess(res, undefined, 'Blocks reordered');
});

export const postUploadBlockImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw badRequest('Image file required');
  const result = await service.uploadBlockImage(req.params.moduleId, req.params.blockId, req.file);
  sendSuccess(res, result, 'Block image uploaded');
});
