import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import { prisma } from '../../db/prisma';
import * as usersService from './users.service';

const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'student']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const createAdminSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

const router = Router();

router.get('/admin/stats', asyncHandler(async (_req, res) => {
  const [totalStudents, activeCourses, certificatesIssued] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'student' } } }),
    prisma.course.count({ where: { status: 'published' } }),
    prisma.certificate.count(),
  ]);
  sendSuccess(res, { totalStudents, activeCourses, certificatesIssued });
}));

router.get('/admin/users', asyncHandler(async (req, res) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest('Invalid query parameters');
  const users = await usersService.listUsers(parsed.data);
  sendSuccess(res, users);
}));

router.post('/admin/admins', asyncHandler(async (req, res) => {
  const parsed = createAdminSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest('firstName, lastName, and a valid email are required');
  const admin = await usersService.createAdmin({ ...parsed.data, createdById: req.user!.userId });
  sendSuccess(res, admin, 'Admin created and invitation sent', 201);
}));

router.patch('/admin/users/:id/activate', asyncHandler(async (req, res) => {
  const user = await usersService.setUserActive({ userId: req.params.id, isActive: true });
  sendSuccess(res, user, 'Account activated');
}));

router.patch('/admin/users/:id/deactivate', asyncHandler(async (req, res) => {
  if (req.params.id === req.user!.userId) throw badRequest('You cannot deactivate your own account');
  const user = await usersService.setUserActive({ userId: req.params.id, isActive: false });
  sendSuccess(res, user, 'Account deactivated');
}));

router.patch('/admin/users/:id/verify-email', asyncHandler(async (req, res) => {
  const user = await usersService.verifyUserEmail({ userId: req.params.id });
  sendSuccess(res, user, 'Email verified');
}));

export default router;
