import jwt from 'jsonwebtoken';

// A diferencia de requireAdmin/requireUser (que exigen un rol exacto), este
// middleware se usa en endpoints donde tanto un lector logueado como el
// admin pueden participar (foro, actividades): deja pasar cualquiera de los
// dos roles y expone en req.auth quién es, para que el controlador decida
// qué datos guardar (autor "Biblioteca" si es admin, o el perfil si es user).
export function requireAnyAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Debes iniciar sesión.' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role === 'admin') {
      req.auth = { isAdmin: true, profileId: null, adminId: payload.sub };
    } else if (payload.role === 'user') {
      req.auth = { isAdmin: false, profileId: payload.sub, adminId: null };
    } else {
      return res.status(401).json({ message: 'Sesión inválida.' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada.' });
  }
}
