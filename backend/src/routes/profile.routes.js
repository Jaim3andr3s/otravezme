import { Router } from 'express';
import { getProfile, updateProfile, setFavorites, setRead, recordGameScore } from '../controllers/profile.controller.js';

const router = Router();

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.put('/:id/favorites', setFavorites);
router.put('/:id/read', setRead);
router.post('/:id/games/:game/score', recordGameScore);

export default router;
