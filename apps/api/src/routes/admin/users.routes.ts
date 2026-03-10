import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import * as usersService from './users.service';

const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'student']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const router = Router();

router.get('/admin/users', asyncHandler(async (req, res) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) throw badRequest('Invalid query parameters');
  const users = await usersService.listUsers(parsed.data);
  sendSuccess(res, users);
}));

router.patch('/admin/users/:id/activate', asyncHandler(async (req, res) => {
  const user = await usersService.setUserActive({ userId: req.params.id, isActive: true });
  sendSuccess(res, user, 'Account activated');
}));

router.patch('/admin/users/:id/deactivate', asyncHandler(async (req, res) => {
  const user = await usersService.setUserActive({ userId: req.params.id, isActive: false });
  sendSuccess(res, user, 'Account deactivated');
}));

export default router;
