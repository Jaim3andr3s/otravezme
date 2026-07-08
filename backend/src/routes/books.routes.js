import { Router } from 'express';
import { listBooks, getBook, createBook, updateBook, deleteBook, voteBook } from '../controllers/books.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listBooks);
router.get('/:id', getBook);
router.post('/', requireAdmin, createBook);
router.put('/:id', requireAdmin, updateBook);
router.delete('/:id', requireAdmin, deleteBook);
router.post('/:id/vote', voteBook);

export default router;
