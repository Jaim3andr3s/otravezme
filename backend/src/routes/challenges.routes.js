import { Router } from 'express';
import { getChallenges } from '../controllers/challenges.controller.js';

const router = Router();

router.get('/', getChallenges);

export default router;