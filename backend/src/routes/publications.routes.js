import { Router } from 'express';
import { listPublications, createArticle, updateArticle, deleteArticle } from '../controllers/publications.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', listPublications);
router.post('/', requireAdmin, createArticle);
router.put('/:id', requireAdmin, validateId(), updateArticle);
router.delete('/:id', requireAdmin, validateId(), deleteArticle);

export default router;
