import { z } from 'zod';

export const readingPlanCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.string().min(1),
  durationWeeks: z.coerce.number().int().positive(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  books: z
    .array(
      z.object({
        bookId: z.coerce.number().int(),
        week: z.coerce.number().int().positive(),
        note: z.string().optional(),
      })
    )
    .min(1),
});
