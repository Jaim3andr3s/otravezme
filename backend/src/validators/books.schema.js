import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  cover: z.string().url(),
  description: z.string().min(1),
  ageRange: z.string().min(1),
  status: z.enum(['DISPONIBLE', 'PRESTADO']).optional(),
  isStaffPick: z.boolean().optional(),
  readOnlineUrl: z.string().url().optional().or(z.literal('')),
});
