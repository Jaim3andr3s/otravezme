import { Router } from 'express';
import { listGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '../controllers/gallery.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listGallery);
router.post('/', requireAdmin, createGalleryImage);
router.put('/:id', requireAdmin, updateGalleryImage);
router.delete('/:id', requireAdmin, deleteGalleryImage);

export default router;