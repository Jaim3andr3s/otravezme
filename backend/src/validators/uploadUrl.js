import { z } from 'zod';

// Muchos campos (portada de libro, imagen de evento, documento de plan...)
// aceptan tanto una URL externa completa (https://...) como la ruta relativa
// que devuelve nuestro propio endpoint de subida de archivos (/uploads/xxx).
// Antes estos campos solo validaban con z.string().url(), lo que rechazaba
// cualquier archivo subido desde el panel de admin. Este helper unifica la
// validación para aceptar ambos casos.
export function uploadableUrl() {
  return z
    .string()
    .refine((val) => val === '' || /^https?:\/\//i.test(val) || val.startsWith('/uploads/'), {
      message: 'Debe ser una URL válida (https://...) o un archivo subido desde el panel de admin.',
    });
}
