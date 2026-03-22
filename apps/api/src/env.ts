import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  PORT:                  z.string().optional(),
  DATABASE_URL:          z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL:             z.string().optional(),
  JWT_ACCESS_SECRET:     z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET:    z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  APP_URL:               z.string().min(1, 'APP_URL is required'),
  AWS_REGION:            z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID:     z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME:        z.string().min(1, 'S3_BUCKET_NAME is required'),
  SMTP_HOST:             z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT:             z.string().optional(),
  SMTP_USER:             z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS:             z.string().min(1, 'SMTP_PASS is required'),
  EMAIL_FROM:            z.string().min(1, 'EMAIL_FROM is required'),
  ADMIN_SEED_EMAIL:      z.string().optional(),
  BCRYPT_ROUNDS:         z.string().optional(),
  SENTRY_DSN:            z.string().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`\nInvalid environment variables:\n${errors}\n`);
    process.exit(1);
  }
  return result.data;
}
