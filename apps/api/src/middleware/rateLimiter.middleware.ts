import { Request, Response, NextFunction } from 'express';
import redis from '../db/redis';
import { tooManyRequests } from '../utils/errors';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
  identifierFn: (req: Request) => string | null;
  message?: string;
}

function createRateLimiter(opts: RateLimiterOptions) {
  const windowSec = Math.ceil(opts.windowMs / 1000);
  const msg = opts.message ?? 'Too many requests, please try again later.';

  return async (req: Request, res: Response, next: NextFunction) => {
    const id = opts.identifierFn(req);
    if (!id) return next();

    const bucket = Math.floor(Date.now() / opts.windowMs);
    const key = `rl:${opts.keyPrefix}:${id}:${bucket}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec);

      res.setHeader('X-RateLimit-Limit', opts.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - count));

      if (count > opts.max) {
        res.setHeader('Retry-After', windowSec);
        return next(tooManyRequests(msg));
      }
    } catch (err) {
      console.error('[RateLimiter] Redis error:', (err as Error).message);
    }

    return next();
  };
}

const getEmail = (req: Request): string | null =>
  (typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : null);

const getUserId = (req: Request): string | null => req.user?.userId ?? null;

const MIN = 60_000;
const HOUR = 3_600_000;

/** POST /auth/login — 10 req / 15 min by email */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * MIN,
  max: 10,
  keyPrefix: 'login',
  identifierFn: getEmail,
  message: 'Too many login attempts, please try again later.',
});

/** POST /auth/password-reset/request — 5 req / hour by email */
export const passwordResetRequestLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 5,
  keyPrefix: 'pw-reset-req',
  identifierFn: getEmail,
  message: 'Too many password reset requests, please try again in an hour.',
});

/** POST /auth/password-reset/confirm — 5 req / hour by email */
export const passwordResetConfirmLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 5,
  keyPrefix: 'pw-reset-confirm',
  identifierFn: getEmail,
  message: 'Too many password reset attempts, please try again in an hour.',
});

/** POST /student/quizzes/:id/attempt — 20 req / hour by user ID */
export const quizAttemptLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 20,
  keyPrefix: 'quiz-attempt',
  identifierFn: getUserId,
  message: 'Quiz attempt limit reached, please try again in an hour.',
});
