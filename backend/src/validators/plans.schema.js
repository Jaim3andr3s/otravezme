import { z } from 'zod';
import { uploadableUrl } from './uploadUrl.js';

export const readingPlanCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.string().min(1),
  durationWeeks: z.coerce.number().int().positive(),
  documentUrl: uploadableUrl().optional().or(z.literal('')),
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
