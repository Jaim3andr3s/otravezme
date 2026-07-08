import { Router } from 'express';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from '../controllers/challenges.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', getChallenges);
router.post('/', requireAdmin, createChallenge);
router.put('/:id', requireAdmin, updateChallenge);
router.delete('/:id', requireAdmin, deleteChallenge);

export default router;