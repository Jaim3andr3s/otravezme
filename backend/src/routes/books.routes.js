import { Router } from 'express';
import { listBooks, getBook, createBook, updateBook, deleteBook, voteBook } from '../controllers/books.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/', listBooks);
router.get('/:id', getBook);
router.post('/:id/vote', voteBook);

// Rutas protegidas (solo admin)
router.post('/', requireAdmin, createBook);
router.put('/:id', requireAdmin, updateBook);
router.delete('/:id', requireAdmin, deleteBook);

export default router;