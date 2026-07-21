import { Router } from 'express';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from '../controllers/challenges.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', getChallenges);
router.post('/', requireAdmin, createChallenge);
router.put('/:id', requireAdmin, validateId(), updateChallenge);
router.delete('/:id', requireAdmin, validateId(), deleteChallenge);

export default router;