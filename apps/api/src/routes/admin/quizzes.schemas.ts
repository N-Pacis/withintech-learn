import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z.string().min(1),
  passingScore: z.number().int().min(0).max(100),
  maxAttempts: z.number().int().positive().default(3),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().positive().optional(),
});

export const addQuestionSchema = z.object({
  text: z.string().min(1),
  orderIndex: z.number().int().positive(),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1),
});

export const reorderQuestionsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number().int().positive(),
  })).min(1),
});

export const addOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().positive(),
});

export const updateOptionSchema = z.object({
  text: z.string().min(1).optional(),
  isCorrect: z.boolean().optional(),
});
