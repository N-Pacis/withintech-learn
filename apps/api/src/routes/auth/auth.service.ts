import { OAuth2Client } from "google-auth-library";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import redis from "../../db/redis";
import { sendEmail } from "../../services/email.service";
import { otpEmailTemplate } from "../../templates/otp-email";
import {
  unauthorized,
  forbidden,
  conflict,
  badRequest,
  tooManyRequests,
} from "../../utils/errors";
import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyResetToken,
  verifyToken,
  decodeTokenUnsafe,
  verifySetPasswordToken,
} from "../../utils/jwt";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateOtp, hashOtp, verifyOtp, otpExpiresAt } from "../../utils/otp";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_OTP_MAX = 5;
const EMAIL_OTP_WINDOW = 3600; // 1 hour in seconds

const authUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  institution: true,
  provider: true,
  passwordHash: true,
  isActive: true,
  emailVerified: true,
  otpCode: true,
  otpPurpose: true,
  otpExpiresAt: true,
  role: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

const authSessionUserSelect = {
  id: true,
  isActive: true,
  emailVerified: true,
  role: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

type SafeUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  institution: string | null;
  role: {
    name: string;
  };
};

const safeUser = (u: SafeUserRecord) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  institution: u.institution,
  role: u.role.name,
});

async function checkEmailOtpRateLimit(email: string) {
  const key = `otp_email_rate:${email.toLowerCase()}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, EMAIL_OTP_WINDOW);
  if (count > EMAIL_OTP_MAX)
    throw tooManyRequests(
      "Too many verification emails sent. Please try again in an hour.",
    );
}

async function sendOtp(
  user: { id: string; email: string; firstName: string },
  purpose: string,
  subject: string,
  purposeLabel: string,
) {
  await checkEmailOtpRateLimit(user.email);

  const otp = generateOtp();
  const code = await hashOtp(otp);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpPurpose: purpose, otpExpiresAt: otpExpiresAt() },
    select: { id: true },
  });

  await sendEmail({
    to: user.email,
    subject,
    html: otpEmailTemplate({ firstName: user.firstName, otp, purposeLabel }),
  });
}

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  });
  if (user?.provider === "google")
    throw unauthorized(
      "This account uses Google Sign-In. Please use the Google button to sign in.",
    );
  if (!user || !(await comparePassword(password, user.passwordHash ?? "")))
    throw unauthorized("Invalid email or password");
  if (!user.isActive)
    throw forbidden(
      "Your account has been deactivated. Please contact an administrator.",
    );

  if (!user.emailVerified) {
    await sendOtp(
      user,
      "email_verification",
      "WithinTech Learn: Verify your email",
      "Email Verification",
    );
    return { requiresEmailVerification: true as const, email: user.email };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoggedIn: new Date() },
    select: { id: true },
  });
  const payload = { userId: user.id, role: user.role.name };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: safeUser(user),
  };
};

export const refreshToken = async ({
  refreshToken: token,
}: {
  refreshToken: string;
}) => {
  const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET as string);

  const logoutAt = await redis.get(`logout_at:${payload.userId}`);
  if (logoutAt) {
    const decoded = decodeTokenUnsafe(token);
    if (decoded?.iat && decoded.iat <= parseInt(logoutAt)) {
      throw unauthorized("Session has been revoked");
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: authSessionUserSelect,
  });
  if (!user || !user.isActive) throw unauthorized("Invalid or expired token");
  if (!user.emailVerified) throw unauthorized("Email verification required");
  return {
    accessToken: signAccessToken({ userId: user.id, role: user.role.name }),
  };
};

export const adminSeed = async () => {
  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });
  await prisma.role.upsert({
    where: { name: "student" },
    update: {},
    create: { name: "student" },
  });

  const existing = await prisma.user.findFirst({
    where: { role: { name: "admin" } },
    select: { email: true },
  });
  if (existing) return { skipped: true as const, email: existing.email };

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "admin" },
  });
  const password = "password";
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      email: process.env.ADMIN_SEED_EMAIL as string,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
    },
    select: { id: true },
  });

  return {
    skipped: false as const,
    email: process.env.ADMIN_SEED_EMAIL,
    password,
  };
};

export const signUp = async ({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  const studentRole = await prisma.role.findUnique({
    where: { name: "student" },
  });
  if (!studentRole)
    throw badRequest(
      "Registration is currently unavailable. Please try again later.",
    );
  const taken = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (taken) throw conflict("Email already in use");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId: studentRole.id,
      isActive: true,
      emailVerified: false,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
    },
  });

  await sendOtp(
    user,
    "email_verification",
    "WithinTech Learn: Verify your email",
    "Email Verification",
  );
  return { requiresEmailVerification: true as const, email: user.email };
};

export const verifyEmailOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  });
  if (!user) throw badRequest("Invalid or expired OTP");

  if (
    !user.otpCode ||
    user.otpPurpose !== "email_verification" ||
    !user.otpExpiresAt ||
    user.otpExpiresAt < new Date()
  )
    throw badRequest("Invalid or expired OTP");
  if (!(await verifyOtp(otp, user.otpCode)))
    throw badRequest("Invalid or expired OTP");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      otpCode: null,
      otpPurpose: null,
      otpExpiresAt: null,
      lastLoggedIn: new Date(),
    },
    select: { id: true },
  });

  const payload = { userId: user.id, role: user.role.name };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: safeUser(user),
  };
};

export const resendEmailVerification = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      emailVerified: true,
    },
  });
  if (!user || user.emailVerified) return true; // no enumeration

  await sendOtp(
    user,
    "email_verification",
    "WithinTech Learn: Verify your email",
    "Email Verification",
  );
  return true;
};

export const requestPasswordReset = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      provider: true,
    },
  });
  if (!user || user.provider === "google") return true; // no enumeration

  await sendOtp(
    user,
    "password_reset",
    "WithinTech Learn: Your password reset code",
    "Password Reset",
  );
  return true;
};

export const verifyResetOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      otpCode: true,
      otpPurpose: true,
      otpExpiresAt: true,
    },
  });
  if (!user) throw badRequest("Invalid or expired OTP");

  if (
    !user.otpCode ||
    user.otpPurpose !== "password_reset" ||
    !user.otpExpiresAt ||
    user.otpExpiresAt < new Date()
  )
    throw badRequest("Invalid or expired OTP");
  if (!(await verifyOtp(otp, user.otpCode)))
    throw badRequest("Invalid or expired OTP");

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpPurpose: null, otpExpiresAt: null },
    select: { id: true },
  });

  return { resetToken: signResetToken(user.id) };
};

export const resetPassword = async ({
  resetToken,
  newPassword,
}: {
  resetToken: string;
  newPassword: string;
}) => {
  const { userId } = verifyResetToken(resetToken);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      institution: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!user) throw unauthorized();

  const passwordHash = await hashPassword(newPassword);
  // Mark email as verified — user proved ownership by receiving the reset OTP
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      isActive: true,
      emailVerified: true,
      lastLoggedIn: new Date(),
    },
    select: { id: true },
  });

  const payload = { userId: user.id, role: user.role.name };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: safeUser(user),
  };
};

export const getProfile = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      institution: true,
      role: { select: { name: true } },
    },
  });
  if (!user) throw unauthorized();
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    institution: user.institution,
    role: user.role.name,
  };
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      provider: true,
      passwordHash: true,
    },
  });
  if (!user) throw unauthorized();
  if (user.provider === "google")
    throw forbidden("Google accounts cannot change password here.");
  if (!(await comparePassword(currentPassword, user.passwordHash ?? "")))
    throw unauthorized("Current password is incorrect");
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
    select: { id: true },
  });
  return true;
};

export const googleAuth = async ({ idToken }: { idToken: string }) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw badRequest("Google sign-in is not configured");

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified)
    throw unauthorized("Invalid Google token");

  const { email, given_name, family_name } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
    select: authUserSelect,
  });

  // Email/password users can also sign in with Google — just authenticate them

  if (!user) {
    const studentRole = await prisma.role.findUnique({
      where: { name: "student" },
    });
    if (!studentRole)
      throw badRequest(
        "Registration is currently unavailable. Please try again later.",
      );

    user = await prisma.user.create({
      data: {
        firstName: given_name ?? "User",
        lastName: family_name ?? "",
        email,
        provider: "google",
        roleId: studentRole.id,
        isActive: true,
        emailVerified: true,
      },
      select: authUserSelect,
    });
  }

  if (!user.isActive)
    throw forbidden(
      "Your account has been deactivated. Please contact an administrator.",
    );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoggedIn: new Date(), emailVerified: true },
    select: { id: true },
  });

  const tokenPayload = { userId: user.id, role: user.role.name };
  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: safeUser(user),
  };
};

export const validateSetPasswordToken = async (token: string) => {
  const { userId, email } = verifySetPasswordToken(token);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  if (!user) throw unauthorized("Invalid or expired link");
  if (user.email !== email) throw unauthorized("Invalid or expired link");
  if (!user.isActive)
    throw forbidden(
      "Your account has been deactivated. Please contact an administrator.",
    );

  return {
    valid: true as const,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

export const setPasswordFromToken = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const { userId } = verifySetPasswordToken(token);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      institution: true,
      isActive: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) throw unauthorized("Invalid or expired link");
  if (!user.isActive)
    throw forbidden(
      "Your account has been deactivated. Please contact an administrator.",
    );

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      emailVerified: true,
      lastLoggedIn: new Date(),
    },
    select: { id: true },
  });

  const payload = { userId: user.id, role: user.role.name };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: safeUser(user),
  };
};
