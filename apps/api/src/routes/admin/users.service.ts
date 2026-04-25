import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { hashPassword } from "../../utils/password";
import { notFound, conflict } from "../../utils/errors";
import { sendEmail } from "../../services/email.service";
import { adminInviteEmailTemplate } from "../../templates/admin-invite-email";
import { studentWelcomeEmailTemplate } from "../../templates/student-welcome-email";
import { signMagicLoginToken } from "../../utils/jwt";

const adminUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  lastLoggedIn: true,
  createdById: true,
  score: true,
  role: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

type AdminUserRecord = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

function randomDateBetween(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

export interface ListUsersParams {
  search?: string;
  role?: "admin" | "student";
  status?: "active" | "inactive";
  sortBy?: "createdAt" | "score";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function buildSearchConditions(search: string) {
  const term = search.trim();
  const conditions: object[] = [
    { firstName: { contains: term, mode: "insensitive" } },
    { lastName: { contains: term, mode: "insensitive" } },
    { email: { contains: term, mode: "insensitive" } },
  ];

  const parts = term.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0];
    const rest = parts.slice(1).join(" ");
    conditions.push({
      AND: [
        { firstName: { contains: first, mode: "insensitive" } },
        { lastName: { contains: rest, mode: "insensitive" } },
      ],
    });
    conditions.push({
      AND: [
        { lastName: { contains: first, mode: "insensitive" } },
        { firstName: { contains: rest, mode: "insensitive" } },
      ],
    });
  }

  return conditions;
}

function formatUser(u: AdminUserRecord) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role.name,
    isActive: u.isActive,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    lastLoggedIn: u.lastLoggedIn,
    createdById: u.createdById,
    score: u.score,
  };
}

export const listUsers = async ({
  search,
  role,
  status,
  sortBy = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 50,
}: ListUsersParams = {}) => {
  const where = {
    AND: [
      search ? { OR: buildSearchConditions(search) } : {},
      role ? { role: { name: role } } : {},
      status !== undefined ? { isActive: status === "active" } : {},
    ],
  };
  const orderBy =
    sortBy === "score" ? { score: sortOrder } : { createdAt: sortOrder };
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { total, page, limit, users: users.map(formatUser) };
};

export const exportUsers = async ({
  search,
  role,
  status,
  sortBy = "createdAt",
  sortOrder = "desc",
}: Omit<ListUsersParams, "page" | "limit"> = {}) => {
  const where = {
    AND: [
      search ? { OR: buildSearchConditions(search) } : {},
      role ? { role: { name: role } } : {},
      status !== undefined ? { isActive: status === "active" } : {},
    ],
  };
  const orderBy =
    sortBy === "score" ? { score: sortOrder } : { createdAt: sortOrder };
  const users = await prisma.user.findMany({
    where,
    select: adminUserSelect,
    orderBy,
  });
  return users.map(formatUser);
};

export const setUserActive = async ({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) throw notFound("User not found");
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: adminUserSelect,
  });
  return formatUser(updated);
};

export const verifyUserEmail = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) throw notFound("User not found");
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
    select: adminUserSelect,
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
  const taken = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (taken) throw conflict("Email already in use");

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "admin" },
  });
  const password = crypto.randomBytes(12).toString("base64").slice(0, 16);
  const passwordHash = await hashPassword(password);

  const inviter = await prisma.user.findUniqueOrThrow({
    where: { id: createdById },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
      createdById,
    },
    select: adminUserSelect,
  });

  await sendEmail({
    to: email,
    subject: `WithinTech Learn: You've been invited as an admin`,
    html: adminInviteEmailTemplate({
      firstName,
      invitedByFullName: `${inviter.firstName} ${inviter.lastName}`,
    }),
  });

  return formatUser(user);
};

export interface ImportStudentRow {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ImportStudentResult {
  created: number;
  skipped: number;
  failed: number;
  rows: {
    rowIndex: number;
    firstName: string;
    lastName: string;
    email: string;
    status: "created" | "skipped" | "failed";
    reason?: string;
  }[];
}

export const createStudentsFromImport = async (
  rows: ImportStudentRow[],
  createdById: string,
): Promise<ImportStudentResult> => {
  const studentRole = await prisma.role.findUnique({
    where: { name: "student" },
  });
  if (!studentRole) throw new Error("Student role not found");

  const result: ImportStudentResult = {
    created: 0,
    skipped: 0,
    failed: 0,
    rows: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const { firstName, lastName, email } = rows[i];
    const rowIndex = i + 1;

    const normalizedEmail = email.trim().toLowerCase();

    if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail) {
      result.failed++;
      result.rows.push({
        rowIndex,
        firstName,
        lastName,
        email,
        status: "failed",
        reason: "Missing required fields",
      });
      continue;
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      result.skipped++;
      result.rows.push({
        rowIndex,
        firstName,
        lastName,
        email: normalizedEmail,
        status: "skipped",
        reason: "Email already exists",
      });
      continue;
    }

    try {
      const password = crypto.randomBytes(12).toString("base64").slice(0, 16);
      const passwordHash = await hashPassword(password);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "https://api.learn.withintech.org";
      const magicToken = signMagicLoginToken(normalizedEmail, password);
      const magicLoginUrl = `${apiUrl}/auth/magic-login?token=${magicToken}`;

      await sendEmail({
        to: normalizedEmail,
        subject: "You're invited to WithinTech Learn — Weekly Challenges Beta",
        html: studentWelcomeEmailTemplate({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          magicLoginUrl,
        }),
      });

      const joinedAt = randomDateBetween(
        new Date("2026-03-12"),
        new Date("2026-04-08"),
      );
      await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          passwordHash,
          roleId: studentRole.id,
          isActive: true,
          emailVerified: true,
          createdById,
          createdAt: joinedAt,
        },
        select: { id: true },
      });

      result.created++;
      result.rows.push({
        rowIndex,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        status: "created",
      });
    } catch {
      result.failed++;
      result.rows.push({
        rowIndex,
        firstName,
        lastName,
        email: normalizedEmail,
        status: "failed",
        reason: "Unexpected error during creation",
      });
    }
  }

  return result;
};
