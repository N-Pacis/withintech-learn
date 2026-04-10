import { Request, Response } from 'express';
import * as service from '../routes/admin/lessons.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';

// ─── Lesson CRUD ──────────────────────────────────────────────────────────────

export const postAddLesson = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addLesson(req.params.moduleId, req.body);
  sendSuccess(res, result, 'Lesson added', 201);
});

export const getListLessons = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listLessons(req.params.moduleId);
  sendSuccess(res, result);
});

export const getOneLesson = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getLesson(req.params.id);
  sendSuccess(res, result);
});

export const patchUpdateLesson = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateLesson(req.params.id, req.body.title);
  sendSuccess(res, result, 'Lesson updated');
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteLesson(req.params.id);
  sendSuccess(res, undefined, 'Lesson deleted');
});

export const postReorderLessons = asyncHandler(async (req: Request, res: Response) => {
  await service.reorderLessons(req.params.moduleId, req.body.items);
  sendSuccess(res, undefined, 'Lessons reordered');
});

// ─── Lesson Block CRUD ────────────────────────────────────────────────────────

export const postAddLessonBlock = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addLessonBlock(req.params.lessonId, req.body);
  sendSuccess(res, result, 'Block added', 201);
});

export const getListLessonBlocks = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listLessonBlocks(req.params.lessonId);
  sendSuccess(res, result);
});

export const patchUpdateLessonBlock = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateLessonBlock(req.params.id, req.body);
  sendSuccess(res, result, 'Block updated');
});

export const deleteLessonBlock = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteLessonBlock(req.params.id);
  sendSuccess(res, undefined, 'Block deleted');
});

export const postReorderLessonBlocks = asyncHandler(async (req: Request, res: Response) => {
  await service.reorderLessonBlocks(req.params.lessonId, req.body.items);
  sendSuccess(res, undefined, 'Blocks reordered');
});

export const postUploadLessonBlockImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw badRequest('Image file required');
  const result = await service.uploadLessonBlockImage(req.params.lessonId, req.params.blockId, req.file);
  sendSuccess(res, result, 'Block image uploaded');
});
