import { z } from 'zod';
import { uploadableUrl } from './uploadUrl.js';

export const bookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  cover: uploadableUrl(),
  description: z.string().min(1),
  ageRange: z.string().min(1),
  status: z.enum(['DISPONIBLE', 'PRESTADO']).optional(),
  isStaffPick: z.boolean().optional(),
  readOnlineUrl: uploadableUrl().optional().or(z.literal('')),
});

export const bookUpdateSchema = bookCreateSchema.partial();
