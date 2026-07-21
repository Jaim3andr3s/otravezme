import { Router } from 'express';
import { requireAnyAuth } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';
import {
  listPosts,
  createPost,
  deletePost,
  toggleLike,
  createComment,
  deleteComment,
} from '../controllers/forum.controller.js';

const router = Router();

router.use(requireAnyAuth);

router.get('/posts', listPosts);
router.post('/posts', createPost);
router.delete('/posts/:id', validateId(), deletePost);
router.post('/posts/:id/like', validateId(), toggleLike);
router.post('/posts/:id/comments', validateId(), createComment);
router.delete('/posts/:id/comments/:commentId', validateId('commentId'), deleteComment);

export default router;
