import { z } from 'zod';
import { isDisposableEmail } from '@withintech-learn/shared';

const emailField = z.string().email();
const trustedEmailField = emailField.refine(
  (v) => !isDisposableEmail(v),
  { message: 'Please use a permanent email address.' },
);
const passwordField = (min: number) => z.string().min(min);

const signupPasswordField = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/\d/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: emailField,
  password: passwordField(6),
});

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: trustedEmailField,
  password: signupPasswordField,
});

export const requestPasswordResetSchema = z.object({
  email: emailField,
});

export const verifyResetOtpSchema = z.object({
  email: emailField,
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordField(8),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordField(6),
  newPassword: passwordField(8),
});
