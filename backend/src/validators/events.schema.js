import { z } from 'zod';
import { uploadableUrl } from './uploadUrl.js';

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['CLUB_LECTURA', 'TALLER', 'CUENTACUENTOS', 'CONFERENCIA', 'GENERAL', 'CONCURSO', 'FECHA_IMPORTANTE']).optional(),
  date: z.coerce.date(),
  location: z.string().optional(),
  imageUrl: uploadableUrl().optional().or(z.literal('')),
});

export const eventUpdateSchema = eventCreateSchema.partial();
