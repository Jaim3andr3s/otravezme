import { z } from 'zod';
import { uploadableUrl } from './uploadUrl.js';

export const activityCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.coerce.date().optional().nullable(),
  attachmentUrl: uploadableUrl().optional().or(z.literal('')),
  attachmentName: z.string().optional().or(z.literal('')),
});

export const activityUpdateSchema = activityCreateSchema.partial();

export const activitySubmissionSchema = z
  .object({
    content: z.string().max(3000).optional().or(z.literal('')),
    fileUrl: uploadableUrl().optional().or(z.literal('')),
    fileName: z.string().optional().or(z.literal('')),
  })
  .refine((data) => Boolean(data.content?.trim()) || Boolean(data.fileUrl), {
    message: 'Escribe algo o adjunta un archivo para entregar la actividad.',
  });

export const activityReviewSchema = z.object({
  status: z.enum(['ENVIADA', 'REVISADA']),
  feedback: z.string().max(1000).optional().or(z.literal('')),
});
