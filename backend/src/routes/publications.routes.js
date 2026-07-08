import { Router } from 'express';
import { listPublications } from '../controllers/publications.controller.js';

const router = Router();

router.get('/', listPublications);

export default router;