import { z } from 'zod';

export const addModuleSchema = z.object({
  title: z.string().min(1),
  orderIndex: z.number().int().positive(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1),
});

export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number().int().positive(),
  })).min(1),
});
