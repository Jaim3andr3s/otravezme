import jwt from 'jsonwebtoken';

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function authenticate(requiredRole) {
  return (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
      const msg = requiredRole === 'admin'
        ? 'Token de administrador requerido.'
        : 'Debes iniciar sesión.';
      return res.status(401).json({ message: msg });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Sesión inválida o expirada.' });
    }

    if (requiredRole && payload.role !== requiredRole) {
      return res.status(401).json({ message: requiredRole === 'admin' ? 'Token inválido.' : 'Sesión inválida.' });
    }

    if (payload.role === 'admin') {
      req.auth = { isAdmin: true, profileId: null, adminId: payload.sub };
      req.admin = payload;
    } else {
      req.auth = { isAdmin: false, profileId: payload.sub, adminId: null };
      req.profileId = payload.sub;
    }

    next();
  };
}

export const requireAdmin = authenticate('admin');
export const requireUser = authenticate('user');
export const requireAnyAuth = authenticate(null);
