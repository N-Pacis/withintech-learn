import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../db/prisma';
import redis from '../../db/redis';
import { sendEmail } from '../../services/email.service';
import { otpEmailTemplate } from '../../templates/otp-email';
import { unauthorized, forbidden, conflict, badRequest, tooManyRequests } from '../../utils/errors';
import { signAccessToken, signRefreshToken, signResetToken, verifyResetToken, verifyToken } from '../../utils/jwt';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateOtp, hashOtp, verifyOtp, otpExpiresAt } from '../../utils/otp';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_OTP_MAX = 5;
const EMAIL_OTP_WINDOW = 3600; // 1 hour in seconds

const safeUser = (u: { id: string; email: string; firstName: string; lastName: string; role: { name: string } }) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  role: u.role.name,
});

async function checkEmailOtpRateLimit(email: string) {
  const key = `otp_email_rate:${email.toLowerCase()}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, EMAIL_OTP_WINDOW);
  if (count > EMAIL_OTP_MAX) throw tooManyRequests('Too many verification emails sent. Please try again in an hour.');
}

async function sendOtp(user: { id: string; email: string; firstName: string }, purpose: string, subject: string, purposeLabel: string) {
  await checkEmailOtpRateLimit(user.email);

  const otp = generateOtp();
  const code = await hashOtp(otp);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpPurpose: purpose, otpExpiresAt: otpExpiresAt() },
  });

  await sendEmail({
    to: user.email,
    subject,
    html: otpEmailTemplate({ firstName: user.firstName, otp, purposeLabel }),
  });
}

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (user?.provider === 'google') throw unauthorized('This account uses Google Sign-In. Please use the Google button to sign in.');
  if (!user || !(await comparePassword(password, user.passwordHash ?? '')))
    throw unauthorized('Invalid email or password');
  if (!user.isActive)
    throw forbidden('Your account has been deactivated. Please contact an administrator.');

  if (!user.emailVerified) {
    await sendOtp(user, 'email_verification', 'WithinTech Learn: Verify your email', 'Email Verification');
    return { requiresEmailVerification: true as const, email: user.email };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoggedIn: new Date() } });
  const payload = { userId: user.id, role: user.role.name };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: safeUser(user) };
};

export const refreshToken = async ({ refreshToken: token }: { refreshToken: string }) => {
  const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET as string);
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } });
  if (!user || !user.isActive) throw unauthorized('Invalid or expired token');
  if (!user.emailVerified) throw unauthorized('Email verification required');
  return { accessToken: signAccessToken({ userId: user.id, role: user.role.name }) };
};

export const adminSeed = async () => {
  await prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin' } });
  await prisma.role.upsert({ where: { name: 'student' }, update: {}, create: { name: 'student' } });

  const existing = await prisma.user.findFirst({ where: { role: { name: 'admin' } } });
  if (existing) return { skipped: true as const, email: existing.email };

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });
  const password = 'password';
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: process.env.ADMIN_SEED_EMAIL as string,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
    },
  });

  return { skipped: false as const, email: process.env.ADMIN_SEED_EMAIL, password };
};

export const signUp = async ({ firstName, lastName, email, password }: { firstName: string; lastName: string; email: string; password: string }) => {
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  if (!studentRole) throw badRequest('Registration is currently unavailable. Please try again later.');
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) throw conflict('Email already in use');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, roleId: studentRole.id, isActive: true, emailVerified: false },
    include: { role: true },
  });

  await sendOtp(user, 'email_verification', 'WithinTech Learn: Verify your email', 'Email Verification');
  return { requiresEmailVerification: true as const, email: user.email };
};

export const verifyEmailOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw badRequest('Invalid or expired OTP');

  if (!user.otpCode || user.otpPurpose !== 'email_verification' || !user.otpExpiresAt || user.otpExpiresAt < new Date())
    throw badRequest('Invalid or expired OTP');
  if (!(await verifyOtp(otp, user.otpCode))) throw badRequest('Invalid or expired OTP');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, otpCode: null, otpPurpose: null, otpExpiresAt: null, lastLoggedIn: new Date() },
  });

  const payload = { userId: user.id, role: user.role.name };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: safeUser(user) };
};

export const resendEmailVerification = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return true; // no enumeration

  await sendOtp(user, 'email_verification', 'WithinTech Learn: Verify your email', 'Email Verification');
  return true;
};

export const requestPasswordReset = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return true; // no enumeration

  await sendOtp(user, 'password_reset', 'WithinTech Learn: Your password reset code', 'Password Reset');
  return true;
};

export const verifyResetOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw badRequest('Invalid or expired OTP');

  if (!user.otpCode || user.otpPurpose !== 'password_reset' || !user.otpExpiresAt || user.otpExpiresAt < new Date())
    throw badRequest('Invalid or expired OTP');
  if (!(await verifyOtp(otp, user.otpCode))) throw badRequest('Invalid or expired OTP');

  await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpPurpose: null, otpExpiresAt: null } });

  return { resetToken: signResetToken(user.id) };
};

export const resetPassword = async ({ resetToken, newPassword }: { resetToken: string; newPassword: string }) => {
  const { userId } = verifyResetToken(resetToken);
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw unauthorized();

  const passwordHash = await hashPassword(newPassword);
  // Mark email as verified — user proved ownership by receiving the reset OTP
  await prisma.user.update({ where: { id: userId }, data: { passwordHash, isActive: true, emailVerified: true, lastLoggedIn: new Date() } });

  const payload = { userId: user.id, role: user.role.name };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: safeUser(user) };
};

export const getProfile = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw unauthorized();
  return safeUser(user);
};

export const changePassword = async ({ userId, currentPassword, newPassword }: { userId: string; currentPassword: string; newPassword: string }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized();
  if (user.provider === 'google') throw forbidden('Google accounts cannot change password here.');
  if (!(await comparePassword(currentPassword, user.passwordHash ?? ''))) throw unauthorized('Current password is incorrect');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
  return true;
};

export const googleAuth = async ({ idToken }: { idToken: string }) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) throw unauthorized('Invalid Google token');

  const { email, given_name, family_name } = payload;

  let user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (user && user.provider === 'email') {
    throw conflict('An account with this email already exists. Please sign in with your email and password.');
  }

  if (!user) {
    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
    if (!studentRole) throw badRequest('Registration is currently unavailable. Please try again later.');

    user = await prisma.user.create({
      data: {
        firstName: given_name ?? 'User',
        lastName: family_name ?? '',
        email,
        provider: 'google',
        roleId: studentRole.id,
        isActive: true,
        emailVerified: true,
      },
      include: { role: true },
    });
  }

  if (!user.isActive) throw forbidden('Your account has been deactivated. Please contact an administrator.');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoggedIn: new Date(), emailVerified: true } });

  const tokenPayload = { userId: user.id, role: user.role.name };
  return { accessToken: signAccessToken(tokenPayload), refreshToken: signRefreshToken(tokenPayload), user: safeUser(user) };
};
