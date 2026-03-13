import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { hashPassword } from '../../utils/password';
import { notFound, conflict } from '../../utils/errors';

export interface ListUsersParams {
  search?: string;
  role?: 'admin' | 'student';
  status?: 'active' | 'inactive';
  sortOrder?: 'asc' | 'desc';
}

function buildSearchConditions(search: string) {
  const term = search.trim();
  const conditions: object[] = [
    { firstName: { contains: term, mode: 'insensitive' } },
    { lastName:  { contains: term, mode: 'insensitive' } },
    { email:     { contains: term, mode: 'insensitive' } },
  ];

  const parts = term.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0];
    const rest  = parts.slice(1).join(' ');
    conditions.push({ AND: [
      { firstName: { contains: first, mode: 'insensitive' } },
      { lastName:  { contains: rest,  mode: 'insensitive' } },
    ]});
    conditions.push({ AND: [
      { lastName:  { contains: first, mode: 'insensitive' } },
      { firstName: { contains: rest,  mode: 'insensitive' } },
    ]});
  }

  return conditions;
}

function formatUser(u: { id: string; firstName: string; lastName: string; email: string; role: { name: string }; isActive: boolean; createdAt: Date; lastLoggedIn: Date | null; createdById: string | null }) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role.name,
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLoggedIn: u.lastLoggedIn,
    createdById: u.createdById,
  };
}

export const listUsers = async ({ search, role, status, sortOrder = 'desc' }: ListUsersParams = {}) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        search ? { OR: buildSearchConditions(search) } : {},
        role ? { role: { name: role } } : {},
        status !== undefined ? { isActive: status === 'active' } : {},
      ],
    },
    include: { role: true },
    orderBy: { createdAt: sortOrder },
  });
  return users.map(formatUser);
};

export const setUserActive = async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw notFound('User not found');
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    include: { role: true },
  });
  return formatUser(updated);
};

export const createAdmin = async ({
  firstName,
  lastName,
  email,
  createdById,
}: {
  firstName: string;
  lastName: string;
  email: string;
  createdById: string;
}) => {
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) throw conflict('Email already in use');

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });
  const password = crypto.randomBytes(12).toString('base64').slice(0, 16);
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      createdById,
    },
    include: { role: true },
  });

  return formatUser(user);
};
