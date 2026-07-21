import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';

function handleZodError(err) {
  return { status: 400, message: 'Datos inválidos.', issues: err.issues };
}

function handlePrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      const model = err.meta?.modelName || 'Registro';
      return { status: 404, message: `${model} no encontrado.` };
    }
    if (err.code === 'P2002') {
      const fields = err.meta?.target || [];
      return { status: 409, message: `El valor ya existe (${fields}).` };
    }
    if (err.code === 'P2003') {
      return { status: 404, message: 'Registro relacionado no encontrado.' };
    }
  }
  return null;
}

function handleJWTError(err) {
  if (err instanceof jwt.JsonWebTokenError) {
    return { status: 401, message: 'Sesión inválida.' };
  }
  if (err instanceof jwt.TokenExpiredError) {
    return { status: 401, message: 'Sesión expirada.' };
  }
  return null;
}

function handleMulterError(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return { status: 413, message: 'El archivo excede el límite de 15 MB.' };
    }
    return { status: 400, message: `Error de subida: ${err.message}` };
  }
  if (err.message?.includes?.('Tipo de archivo no permitido')) {
    return { status: 400, message: err.message };
  }
  return null;
}

export function errorHandler(err, req, res, next) {
  const handlers = [handleZodError, handlePrismaError, handleJWTError, handleMulterError];

  for (const handler of handlers) {
    const result = handler(err);
    if (result) {
      const { status, message, issues } = result;
      const body = { message };
      if (issues) body.issues = issues;
      return res.status(status).json(body);
    }
  }

  console.error('Error no manejado:', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno del servidor.' });
}
