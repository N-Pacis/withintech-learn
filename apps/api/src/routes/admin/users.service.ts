import { prisma } from '../../db/prisma';
import { notFound } from '../../utils/errors';

export interface ListUsersParams {
  search?: string;
  role?: 'admin' | 'student';
  status?: 'active' | 'inactive';
  sortOrder?: 'asc' | 'desc';
}

// Build Prisma OR conditions for a search string.
// Single word  → match firstName, lastName, or email.
// Multiple words → also try "first word = firstName AND rest = lastName"
//                  and the reverse, so "Jane Doe" and "Doe Jane" both work.
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
    // "Jane Doe"
    conditions.push({ AND: [
      { firstName: { contains: first, mode: 'insensitive' } },
      { lastName:  { contains: rest,  mode: 'insensitive' } },
    ]});
    // "Doe Jane"
    conditions.push({ AND: [
      { lastName:  { contains: first, mode: 'insensitive' } },
      { firstName: { contains: rest,  mode: 'insensitive' } },
    ]});
  }

  return conditions;
}

export const listUsers = async ({ search, role, status, sortOrder = 'desc' }: ListUsersParams = {}) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: buildSearchConditions(search),
            }
          : {},
        role ? { role: { name: role } } : {},
        status !== undefined ? { isActive: status === 'active' } : {},
      ],
    },
    include: { role: true },
    orderBy: { createdAt: sortOrder },
  });
  return users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role.name,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
};

export const setUserActive = async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw notFound('User not found');
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    include: { role: true },
  });
  return {
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    role: updated.role.name,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
  };
};
