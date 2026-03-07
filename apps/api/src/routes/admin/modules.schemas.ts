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

export const addBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: z.string().min(1),
    orderIndex: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('image'),
    caption: z.string().optional(),
    orderIndex: z.number().int().positive(),
  }),
]);

export const updateBlockSchema = z.object({
  content: z.string().min(1).optional(),
  caption: z.string().optional(),
});
