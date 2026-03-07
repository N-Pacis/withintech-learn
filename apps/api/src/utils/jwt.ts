import jwt from 'jsonwebtoken';
import { unauthorized } from './errors';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw unauthorized('Invalid or expired token');
  }
};
