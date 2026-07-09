import { Router } from 'express';
import { listPublications, createArticle, updateArticle, deleteArticle } from '../controllers/publications.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listPublications);
router.post('/', requireAdmin, createArticle);
router.put('/:id', requireAdmin, updateArticle);
router.delete('/:id', requireAdmin, deleteArticle);

export default router;