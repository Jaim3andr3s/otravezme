import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const googleLoginSchema = z.object({
  credential: z.string().min(1),
});

export const guestLoginSchema = z.object({
  guestToken: z.string().min(1).optional(),
});
