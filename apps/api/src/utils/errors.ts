export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const notFound = (msg = 'Not found') => new AppError(msg, 404);
export const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);
export const forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
export const badRequest = (msg = 'Bad request') => new AppError(msg, 400);
export const conflict = (msg = 'Conflict') => new AppError(msg, 409);
