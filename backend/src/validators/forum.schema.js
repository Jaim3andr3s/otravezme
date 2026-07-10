import { z } from 'zod';
import { uploadableUrl } from './uploadUrl.js';

export const forumPostCreateSchema = z.object({
  content: z.string().min(1, 'Escribe algo antes de publicar.').max(2000),
  imageUrl: uploadableUrl().optional().or(z.literal('')),
});

export const forumCommentCreateSchema = z.object({
  content: z.string().min(1, 'Escribe un comentario antes de enviarlo.').max(1000),
});
