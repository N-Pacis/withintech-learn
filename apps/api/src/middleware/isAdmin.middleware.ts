import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/errors';

export const isAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') throw forbidden('Admin access required');
  next();
};
