import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
