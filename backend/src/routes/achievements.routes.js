import { Router } from 'express';
import { listAchievements } from '../controllers/achievements.controller.js';

const router = Router();

router.get('/', listAchievements);

export default router;
