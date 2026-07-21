import { Router } from 'express';
import { createUpload } from '../controllers/uploads.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', requireAdmin, upload.single('file'), createUpload);

export default router;
