import { z } from 'zod';
import { CHALLENGE_CATEGORIES } from '../student/showcase.schemas';

export const adminListShowcaseSchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(50).default(20),
  status:   z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  category: z.enum(CHALLENGE_CATEGORIES).optional(),
  search:   z.string().optional(),
});

export const rejectShowcaseSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});
