import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/isAdmin.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  loginSchema,
  signupSchema,
  requestPasswordResetSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailOtpSchema,
  resendEmailVerificationSchema,
} from './auth.schemas';
import {
  postLogin,
  postSignUp,
  postRefreshToken,
  postRequestPasswordReset,
  postVerifyResetOtp,
  postResetPassword,
  postChangePassword,
  getProfile,
  postVerifyEmailOtp,
  postResendEmailVerification,
} from '../../controllers/auth.controller';

const router = Router();

router.post('/auth/login', validate(loginSchema), postLogin);
router.post('/auth/signup', validate(signupSchema), postSignUp);
router.post('/auth/refresh', postRefreshToken);
router.post('/auth/password-reset/request', validate(requestPasswordResetSchema), postRequestPasswordReset);
router.post('/auth/password-reset/verify', validate(verifyResetOtpSchema), postVerifyResetOtp);
router.post('/auth/password-reset/confirm', validate(resetPasswordSchema), postResetPassword);
router.post('/auth/password/change', authenticate, validate(changePasswordSchema), postChangePassword);
router.get('/auth/profile', authenticate, getProfile);
router.post('/auth/email/verify', validate(verifyEmailOtpSchema), postVerifyEmailOtp);
router.post('/auth/email/resend', validate(resendEmailVerificationSchema), postResendEmailVerification);

export default router;
