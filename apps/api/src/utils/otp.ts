import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);

export const generateOtp = (): string =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

export const hashOtp = (otp: string): Promise<string> =>
  bcrypt.hash(otp, SALT_ROUNDS);

export const verifyOtp = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const otpExpiresAt = (): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
};
