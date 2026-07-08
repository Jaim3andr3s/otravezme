import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  setFavorites, 
  setRead, 
  recordGameScore,
  getDiplomas, // NUEVO
} from '../controllers/profile.controller.js';
import { requireUser } from '../middleware/requireUser.js';

const router = Router();

router.use(requireUser);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/favorites', setFavorites);
router.put('/me/read', setRead);
router.post('/me/games/:game/score', recordGameScore);

// NUEVO: diplomas del usuario autenticado
router.get('/me/diplomas', getDiplomas);

export default router;