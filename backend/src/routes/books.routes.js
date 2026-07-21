import { Router } from 'express';
import { listBooks, getBook, createBook, updateBook, deleteBook, voteBook } from '../controllers/books.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', listBooks);
router.get('/:id', validateId(), getBook);
router.post('/:id/vote', validateId(), voteBook);

router.post('/', requireAdmin, createBook);
router.put('/:id', requireAdmin, validateId(), updateBook);
router.delete('/:id', requireAdmin, validateId(), deleteBook);

export default router;
