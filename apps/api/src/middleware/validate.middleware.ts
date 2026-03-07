import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { badRequest } from '../utils/errors';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) throw badRequest(result.error.errors[0]?.message ?? 'Validation error');
    req.body = result.data;
    next();
  };
