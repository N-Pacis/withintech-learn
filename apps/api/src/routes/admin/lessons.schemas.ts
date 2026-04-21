import { z } from 'zod';

export const addLessonSchema = z.object({
  title: z.string().min(1),
  orderIndex: z.number().int().positive(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1),
});

export const reorderLessonsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    orderIndex: z.number().int().positive(),
  })).min(1),
});

const CODE_LANGUAGES = [
  'html',
  'css',
  'javascript',
  'typescript',
  'python',
  'markdown',
  'text',
  'bash',
  'cpp',
  'csharp',
  'rust',
  'java',
  'php',
  'xml',
  'yaml',
] as const;

export const addLessonBlockSchema = z.discriminatedUnion('type', [
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
  z.object({
    type: z.literal('code'),
    content: z.string().min(1),
    language: z.enum(CODE_LANGUAGES),
    orderIndex: z.number().int().positive(),
  }),
]);

export const updateLessonBlockSchema = z.object({
  content: z.string().min(1).optional(),
  caption: z.string().optional(),
  language: z.enum(CODE_LANGUAGES).optional(),
});
