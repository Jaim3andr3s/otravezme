import { Router } from 'express';
import { login, googleLogin, guestLogin } from '../controllers/auth.controller.js';
import { loginRateLimiter, userLoginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.post('/google', userLoginRateLimiter, googleLogin);
router.post('/guest', userLoginRateLimiter, guestLogin);

export default router;
