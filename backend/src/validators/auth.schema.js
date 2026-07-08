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

// Registro de usuario normal
export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// Login con email (para usuarios normales)
export const emailLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});