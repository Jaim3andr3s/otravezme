import { Router } from 'express';
import {
  login,
  googleLogin,
  guestLogin,
  register,
  emailLogin,
  unifiedLogin,
} from '../controllers/auth.controller.js';
import { loginRateLimiter, userLoginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Admin login (existente)
router.post('/login', loginRateLimiter, login);

// Usuarios
router.post('/google', userLoginRateLimiter, googleLogin);
router.post('/guest', userLoginRateLimiter, guestLogin);
router.post('/register', userLoginRateLimiter, register);
router.post('/login-email', userLoginRateLimiter, emailLogin);

// NUEVO: login unificado (admin + usuario normal)
router.post('/login-unified', userLoginRateLimiter, unifiedLogin);

export default router;