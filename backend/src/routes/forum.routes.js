import { Router } from 'express';
import { requireAnyAuth } from '../middleware/requireAnyAuth.js';
import {
  listPosts,
  createPost,
  deletePost,
  toggleLike,
  createComment,
  deleteComment,
} from '../controllers/forum.controller.js';

const router = Router();

// Todo el foro requiere sesión (lector o admin); es un espacio de la
// comunidad de la biblioteca, no contenido público abierto.
router.use(requireAnyAuth);

router.get('/posts', listPosts);
router.post('/posts', createPost);
router.delete('/posts/:id', deletePost);
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comments', createComment);
router.delete('/posts/:id/comments/:commentId', deleteComment);

export default router;
