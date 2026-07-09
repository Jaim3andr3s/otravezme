import { z } from 'zod';

export const gameScoreSchema = z.object({
  score: z.coerce.number().int().min(0),
  won: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});
