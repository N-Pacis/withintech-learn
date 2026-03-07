import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { badRequest } from '../utils/errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

const _upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(badRequest('Only JPEG, PNG, and WebP images are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('image');

export const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  _upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(badRequest('File size must not exceed 5MB'));
    }
    next(err);
  });
};
