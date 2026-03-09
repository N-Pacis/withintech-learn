import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const listCoursesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isPublished: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
