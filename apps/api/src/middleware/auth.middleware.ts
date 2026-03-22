import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { unauthorized } from '../utils/errors';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.wt_access as string | undefined;
  if (!token) throw unauthorized('Missing token');
  const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET as string);
  req.user = { userId: payload.userId, role: payload.role };
  next();
};
