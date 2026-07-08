import { z } from 'zod';

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['CLUB_LECTURA', 'TALLER', 'CUENTACUENTOS', 'CONFERENCIA', 'GENERAL']).optional(),
  date: z.coerce.date(),
  location: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});
