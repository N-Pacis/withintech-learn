import jwt from "jsonwebtoken";
import { unauthorized } from "./errors";

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface ResetTokenPayload {
  userId: string;
  purpose: "password_reset";
}

export interface MagicLoginTokenPayload {
  email: string;
  password: string;
  purpose: "magic_login";
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });

export const signResetToken = (userId: string): string =>
  jwt.sign(
    { userId, purpose: "password_reset" },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "10m" },
  );

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw unauthorized("Invalid or expired token");
  }
};

export const decodeTokenUnsafe = (token: string): (TokenPayload & { iat?: number }) | null => {
  try {
    return jwt.decode(token) as (TokenPayload & { iat?: number }) | null;
  } catch {
    return null;
  }
};

export const verifyResetToken = (token: string): ResetTokenPayload => {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as ResetTokenPayload;
    if (payload.purpose !== "password_reset") throw new Error();
    return payload;
  } catch {
    throw unauthorized("Invalid or expired reset token");
  }
};

export const signMagicLoginToken = (email: string, password: string): string =>
  jwt.sign(
    { email, password, purpose: "magic_login" },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "20d" },
  );

export const verifyMagicLoginToken = (
  token: string,
): MagicLoginTokenPayload => {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as MagicLoginTokenPayload;
    if (payload.purpose !== "magic_login") throw new Error();
    return payload;
  } catch {
    throw unauthorized("Invalid or expired magic login link");
  }
};
