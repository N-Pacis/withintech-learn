import { Request, Response } from 'express';
import * as authService from '../routes/auth/auth.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Logged in successfully');
});

export const postRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body);
  sendSuccess(res, result, 'Token refreshed');
});

export const postLogout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout({ userId: req.user!.userId });
  sendSuccess(res, undefined, 'Logged out');
});

export const postSignUp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signUp(req.body);
  sendSuccess(res, result, 'Account created successfully', 201);
});

export const postRequestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body);
  sendSuccess(res, undefined, 'If that email exists, a reset code has been sent');
});

export const postVerifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyResetOtp(req.body);
  sendSuccess(res, result, 'OTP verified');
});

export const postResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, result, 'Password reset successfully');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile({ userId: req.user!.userId });
  sendSuccess(res, result);
});

export const postChangePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword({ ...req.body, userId: req.user!.userId });
  sendSuccess(res, undefined, 'Password changed successfully');
});
