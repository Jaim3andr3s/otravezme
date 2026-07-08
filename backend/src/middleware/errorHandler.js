export function errorHandler(err, req, res, next) {
  if (err.name === 'ZodError') {
    return res.status(400).json({ message: 'Datos inválidos.', issues: err.issues });
  }

  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno del servidor.' });
}
