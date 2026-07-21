import { Router } from 'express';
import { listGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '../controllers/gallery.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', listGallery);
router.post('/', requireAdmin, createGalleryImage);
router.put('/:id', requireAdmin, validateId(), updateGalleryImage);
router.delete('/:id', requireAdmin, validateId(), deleteGalleryImage);

export default router;
