import { z } from 'zod';

const emailField = z.string().email();
const passwordField = (min: number) => z.string().min(min);

export const loginSchema = z.object({
  email: emailField,
  password: passwordField(6),
});

export const registerUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: emailField,
});

export const requestPasswordResetSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  email: emailField,
  otp: z.string().length(6),
  newPassword: passwordField(8),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordField(6),
  newPassword: passwordField(8),
});
