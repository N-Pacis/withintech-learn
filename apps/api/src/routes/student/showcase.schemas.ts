import { z } from 'zod';

export const CHALLENGE_CATEGORIES = [
  'Agriculture',
  'Healthcare',
  'Education',
  'Water',
  'Energy',
  'Finance',
  'Transport',
  'Environment',
  'Employment',
  'Digital',
] as const;

const urlOrEmpty = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''));

const tagArray = z
  .array(z.string().min(1).max(50))
  .max(20)
  .default([]);

export const createShowcaseSchema = z.object({
  title:              z.string().min(1, 'Title is required').max(120),
  description:        z.string().max(3000).optional(),
  problemStatement:   z.string().min(1, 'Problem statement is required').max(3000),
  categories:         z.array(z.enum(CHALLENGE_CATEGORIES)).max(5).default([]),
  githubUrl:          urlOrEmpty,
  demoUrl:            urlOrEmpty,
  aiUsageDescription: z.string().max(3000).optional(),
  techTags:           tagArray,
  aiTools:            tagArray,
});

export const listStudentShowcaseSchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(50).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
});

export type CreateShowcaseInput = z.infer<typeof createShowcaseSchema>;
