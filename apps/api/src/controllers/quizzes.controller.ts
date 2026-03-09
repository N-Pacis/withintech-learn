import { Request, Response } from 'express';
import * as service from '../routes/admin/quizzes.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const getModuleQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getModuleQuiz(req.params.moduleId);
  sendSuccess(res, result);
});

export const postCreateModuleQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.createModuleQuiz(req.params.moduleId, req.body);
  sendSuccess(res, result, 'Quiz created', 201);
});

export const getCourseQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getCourseQuiz(req.params.courseId);
  sendSuccess(res, result);
});

export const postCreateCourseQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.createCourseQuiz(req.params.courseId, req.body);
  sendSuccess(res, result, 'Quiz created', 201);
});

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getQuiz(req.params.id);
  sendSuccess(res, result);
});

export const patchUpdateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateQuiz(req.params.id, req.body);
  sendSuccess(res, result, 'Quiz updated');
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteQuiz(req.params.id);
  sendSuccess(res, undefined, 'Quiz deleted');
});

export const postAddQuestion = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addQuestion(req.params.quizId, req.body);
  sendSuccess(res, result, 'Question added', 201);
});

export const patchUpdateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateQuestion(req.params.id, req.body.text);
  sendSuccess(res, result, 'Question updated');
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteQuestion(req.params.id);
  sendSuccess(res, undefined, 'Question deleted');
});

export const postReorderQuestions = asyncHandler(async (req: Request, res: Response) => {
  await service.reorderQuestions(req.params.quizId, req.body.items);
  sendSuccess(res, undefined, 'Questions reordered');
});

export const postAddOption = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.addOption(req.params.questionId, req.body);
  sendSuccess(res, result, 'Option added', 201);
});

export const patchUpdateOption = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateOption(req.params.id, req.body);
  sendSuccess(res, result, 'Option updated');
});

export const deleteOption = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteOption(req.params.id);
  sendSuccess(res, undefined, 'Option deleted');
});
