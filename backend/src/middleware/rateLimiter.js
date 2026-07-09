import rateLimit from 'express-rate-limit';

// Strict: protects the single shared admin password against brute-forcing.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de acceso. Intenta de nuevo más tarde.' },
});

// Lenient: guest/Google sign-in happens on every app launch and reconnect,
// so it needs headroom far above a brute-force threshold.
export const userLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});
