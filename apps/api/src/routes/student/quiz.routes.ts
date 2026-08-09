import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { submitQuiz, getQuizAttemptState } from './quiz.service';

const router = Router();

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        chosenOptionIds: z.array(z.string().uuid()).min(1),
      }),
    )
    .min(1),
});

router.get('/student/quizzes/:quizId/state', asyncHandler(async (req: Request, res: Response) => {
  const result = await getQuizAttemptState(req.user!.userId, req.params.quizId);
  sendSuccess(res, result);
}));

router.post('/student/quizzes/:quizId/attempt', asyncHandler(async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await submitQuiz(req.user!.userId, req.params.quizId, parsed.data.answers);
  sendSuccess(res, result, 'Quiz submitted', 201);
}));

export default router;
