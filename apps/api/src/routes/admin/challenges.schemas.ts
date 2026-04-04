import { z } from 'zod';

const starterCodeSchema = z.object({
  python:     z.string().default(''),
  java:       z.string().default(''),
  javascript: z.string().default(''),
  c:          z.string().default(''),
  cpp:        z.string().default(''),
  go:         z.string().default(''),
});

export const createChallengeSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().min(1),
  difficulty:  z.enum(['easy', 'medium', 'hard']),
  starterCode: starterCodeSchema.default({}),
  timeLimit:   z.number().int().min(1).max(15).default(5),
  orderIndex:  z.number().int().min(0).default(0),
});

export const updateChallengeSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  difficulty:  z.enum(['easy', 'medium', 'hard']).optional(),
  starterCode: starterCodeSchema.optional(),
  timeLimit:   z.number().int().min(1).max(15).optional(),
  orderIndex:  z.number().int().min(0).optional(),
});

export const listChallengesSchema = z.object({
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().positive().max(100).default(20),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  status:     z.enum(['draft', 'published']).optional(),
});

export const createTestCaseSchema = z.object({
  input:          z.string(),
  expectedOutput: z.string().min(1),
  isHidden:       z.boolean().default(true),
  orderIndex:     z.number().int().min(0),
});

export const updateTestCaseSchema = z.object({
  input:          z.string().optional(),
  expectedOutput: z.string().min(1).optional(),
  isHidden:       z.boolean().optional(),
  orderIndex:     z.number().int().min(0).optional(),
});
