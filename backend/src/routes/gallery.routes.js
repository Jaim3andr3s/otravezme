import { Router } from 'express';
import { listGallery } from '../controllers/gallery.controller.js';

const router = Router();

router.get('/', listGallery);

export default router;