import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/isAdmin.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  loginSchema,
  signupSchema,
  registerUserSchema,
  requestPasswordResetSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schemas';
import {
  postLogin,
  postSignUp,
  postRefreshToken,
  postLogout,
  postRequestPasswordReset,
  postVerifyResetOtp,
  postResetPassword,
  postChangePassword,
  getProfile,
} from '../../controllers/auth.controller';

const router = Router();

router.post('/auth/login', validate(loginSchema), postLogin);
router.post('/auth/signup', validate(signupSchema), postSignUp);
router.post('/auth/refresh', postRefreshToken);
router.post('/auth/logout', authenticate, postLogout);
router.post('/auth/password-reset/request', validate(requestPasswordResetSchema), postRequestPasswordReset);
router.post('/auth/password-reset/verify', validate(verifyResetOtpSchema), postVerifyResetOtp);
router.post('/auth/password-reset/confirm', validate(resetPasswordSchema), postResetPassword);
router.post('/auth/password/change', authenticate, validate(changePasswordSchema), postChangePassword);
router.get('/auth/profile', authenticate, getProfile);

export default router;
