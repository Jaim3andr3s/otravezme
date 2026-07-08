import { Router } from 'express';
import { getProfile, updateProfile, setFavorites, setRead } from '../controllers/profile.controller.js';

const router = Router();

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.put('/:id/favorites', setFavorites);
router.put('/:id/read', setRead);

export default router;
