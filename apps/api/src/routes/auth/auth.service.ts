import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { sendEmail } from '../../services/email.service';
import { otpEmailTemplate } from '../../templates/otp-email';
import { unauthorized, forbidden, conflict, badRequest } from '../../utils/errors';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateOtp, hashOtp, verifyOtp, otpExpiresAt } from '../../utils/otp';

const safeUser = (u: { id: string; email: string; firstName: string; lastName: string; role: { name: string } }) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  role: u.role.name,
});

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || !(await comparePassword(password, user.passwordHash)))
    throw unauthorized('Invalid email or password');
  if (!user.isActive)
    throw forbidden('Account not activated. Please reset your password to activate your account.');
  const payload = { userId: user.id, role: user.role.name };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: safeUser(user) };
};

export const refreshToken = async ({ refreshToken: token }: { refreshToken: string }) => {
  const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET as string);
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } });
  if (!user || !user.isActive) throw unauthorized('User not found or inactive');
  return { accessToken: signAccessToken({ userId: user.id, role: user.role.name }) };
};

export const logout = async ({ userId: _userId }: { userId: string }) => {
  // TODO: invalidate refresh token in Redis
  return true;
};

export const adminSeed = async () => {
  await prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin' } });
  await prisma.role.upsert({ where: { name: 'student' }, update: {}, create: { name: 'student' } });

  const existing = await prisma.user.findFirst({ where: { role: { name: 'admin' } } });
  if (existing) return { skipped: true as const, email: existing.email };

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });
  const password = crypto.randomBytes(12).toString('base64').slice(0, 16);
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: process.env.ADMIN_SEED_EMAIL as string,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  return { skipped: false as const, email: process.env.ADMIN_SEED_EMAIL, password };
};

export const registerUser = async ({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) => {
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  if (!studentRole) throw badRequest('Student role not found. Run /api/auth/seed first.');
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) throw conflict('Email already in use');

  const password = crypto.randomBytes(12).toString('base64').slice(0, 16);
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, roleId: studentRole.id, isActive: false },
  });

  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
};

export const requestPasswordReset = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return true; // no enumeration

  await prisma.otpCode.updateMany({
    where: { userId: user.id, purpose: 'password_reset', usedAt: null },
    data: { usedAt: new Date() },
  });

  const otp = generateOtp();
  const code = await hashOtp(otp);
  await prisma.otpCode.create({
    data: { userId: user.id, code, purpose: 'password_reset', expiresAt: otpExpiresAt() },
  });

  await sendEmail({
    to: user.email,
    subject: 'Your password reset code',
    html: otpEmailTemplate({ firstName: user.firstName, otp, purposeLabel: 'Password Reset' }),
  });

  return true;
};

export const resetPassword = async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw badRequest('Invalid or expired OTP');

  const record = await prisma.otpCode.findFirst({
    where: { userId: user.id, purpose: 'password_reset', usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw badRequest('Invalid or expired OTP');
  if (!(await verifyOtp(otp, record.code))) throw badRequest('Invalid or expired OTP');

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash, isActive: true } }),
    prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return true;
};

export const getProfile = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { role: true } });
  return safeUser(user);
};

export const changePassword = async ({ userId, currentPassword, newPassword }: { userId: string; currentPassword: string; newPassword: string }) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await comparePassword(currentPassword, user.passwordHash))) throw unauthorized('Current password is incorrect');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
  return true;
};
