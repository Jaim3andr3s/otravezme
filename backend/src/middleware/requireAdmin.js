import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de administrador requerido.' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}