import { Request, Response } from 'express';
import * as authService from '../routes/auth/auth.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { unauthorized } from '../utils/errors';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
};

const ACCESS_TTL  = 15 * 60 * 1000;           // 15 minutes
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;  // 7 days

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('wt_access',  accessToken,  { ...COOKIE_BASE, maxAge: ACCESS_TTL });
  res.cookie('wt_refresh', refreshToken, { ...COOKIE_BASE, maxAge: REFRESH_TTL });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('wt_access',  COOKIE_BASE);
  res.clearCookie('wt_refresh', COOKIE_BASE);
}

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'Logged in successfully');
});

export const postRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.wt_refresh as string | undefined;
  if (!refreshToken) throw unauthorized('Missing refresh token');
  const result = await authService.refreshToken({ refreshToken });
  res.cookie('wt_access', result.accessToken, { ...COOKIE_BASE, maxAge: ACCESS_TTL });
  sendSuccess(res, undefined, 'Token refreshed');
});

export const postLogout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  sendSuccess(res, undefined, 'Logged out');
});

export const postSignUp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signUp(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'Account created successfully', 201);
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
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'Password reset successfully');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile({ userId: req.user!.userId });
  sendSuccess(res, result);
});

export const postChangePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword({ ...req.body, userId: req.user!.userId });
  sendSuccess(res, undefined, 'Password changed successfully');
});
