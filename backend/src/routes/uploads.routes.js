import { Router } from 'express';
import { createUpload } from '../controllers/uploads.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// POST /api/uploads — sube un único archivo (campo "file") y devuelve su
// URL pública. Usado por los formularios de admin (galería, publicaciones,
// retos de lectura) para subir imágenes, PDF o Word.
router.post('/', requireAdmin, upload.single('file'), createUpload);

export default router;
