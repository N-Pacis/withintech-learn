import { z } from 'zod';

const accessTypeEnum = z.enum(['FREE', 'PAID_COURSE', 'PAID_CERTIFICATE']);

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  accessType: accessTypeEnum.optional(),
  price: z.number().min(100, 'price must be at least 100').optional(),
  certificatePrice: z.number().min(100, 'certificatePrice must be at least 100').optional(),
}).refine(
  (d) => d.accessType !== 'PAID_COURSE' || (d.price != null && d.price >= 100),
  { message: 'price is required for PAID_COURSE and must be at least 100', path: ['price'] },
).refine(
  (d) => d.accessType !== 'PAID_CERTIFICATE' || (d.certificatePrice != null && d.certificatePrice >= 100),
  { message: 'certificatePrice is required for PAID_CERTIFICATE and must be at least 100', path: ['certificatePrice'] },
);

export const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  accessType: accessTypeEnum.optional(),
  price: z.number().min(100, 'price must be at least 100').optional(),
  certificatePrice: z.number().min(100, 'certificatePrice must be at least 100').optional(),
});

export const listCoursesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
