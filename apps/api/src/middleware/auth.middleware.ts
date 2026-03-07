import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { unauthorized } from '../utils/errors';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw unauthorized('Missing token');
  const token = header.slice(7);
  const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET as string);
  req.user = { userId: payload.userId, role: payload.role };
  next();
};
