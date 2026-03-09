import { Request, Response } from 'express';
import * as service from '../routes/admin/courses.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';
import { listCoursesSchema } from '../routes/admin/courses.schemas';

export const postCreateCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.createCourse({ ...req.body, userId: req.user!.userId });
  sendSuccess(res, result, 'Course created', 201);
});

export const getListCourses = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listCoursesSchema.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await service.listCourses(parsed.data);
  sendSuccess(res, result);
});

export const getOneCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getCourse(req.params.id);
  sendSuccess(res, result);
});

export const patchUpdateCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateCourse(req.params.id, req.body);
  sendSuccess(res, result, 'Course updated');
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteCourse(req.params.id);
  sendSuccess(res, undefined, 'Course deleted');
});

export const patchPublishCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.publishCourse(req.params.id);
  sendSuccess(res, result, 'Course published');
});

export const patchArchiveCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.archiveCourse(req.params.id);
  sendSuccess(res, result, 'Course archived');
});

export const postUploadThumbnail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw badRequest('Image file required');
  const result = await service.uploadThumbnail(req.params.id, req.file);
  sendSuccess(res, result, 'Thumbnail uploaded');
});
