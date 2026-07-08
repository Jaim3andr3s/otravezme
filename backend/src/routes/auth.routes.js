import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginRateLimiter, login);

export default router;
