import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { submitQuiz, getQuizAttemptState, startQuizAttempt } from './quiz.service';

const router = Router();

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        // May be empty. When the clock runs out the browser submits whatever is
        // ticked, and a blank question is simply marked wrong. Requiring one
        // choice per question would throw away the answers the student did give.
        chosenOptionIds: z.array(z.string().uuid()),
      }),
    )
    .min(1),
  // Comes from the browser, so it is capped rather than trusted. A student who
  // switched tabs 400 times and one who switched 200 times are the same story.
  warningCount: z.coerce.number().int().min(0).max(200).optional(),
});

router.get('/student/quizzes/:quizId/state', asyncHandler(async (req: Request, res: Response) => {
  const result = await getQuizAttemptState(req.user!.userId, req.params.quizId);
  sendSuccess(res, result);
}));

// Opens a sitting and starts the clock. The clock is held here, not in the
// browser, so the countdown the student sees cannot be edited into more time.
router.post('/student/quizzes/:quizId/start', asyncHandler(async (req: Request, res: Response) => {
  const result = await startQuizAttempt(req.user!.userId, req.params.quizId);
  sendSuccess(res, result, 'Quiz started', 201);
}));

router.post('/student/quizzes/:quizId/attempt', asyncHandler(async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.errors[0]?.message ?? 'Validation error');
  const result = await submitQuiz(
    req.user!.userId,
    req.params.quizId,
    parsed.data.answers,
    parsed.data.warningCount ?? 0,
  );
  sendSuccess(res, result, 'Quiz submitted', 201);
}));

export default router;
