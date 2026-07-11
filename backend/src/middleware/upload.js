import multer from 'multer';

// Antes esto guardaba los archivos en el disco local del servidor. Se
// cambió a memoryStorage: el archivo llega como un buffer en memoria
// (req.file.buffer) y el controller lo sube directo a Cloudinary, sin
// tocar el disco. Esto resuelve dos problemas reales del hosting gratuito:
// 1. El disco de Render (free tier) es efímero — se borraba todo en cada
//    redeploy o reinicio.
// 2. En desarrollo, escribir archivos dentro del proyecto hacía que
//    `node --watch` reiniciara el servidor a mitad de la subida.
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpg, png, webp, gif), PDF o Word (doc, docx).'));
  }
  cb(null, true);
}

// Límite de 15 MB por archivo, suficiente para fotos y documentos de varias páginas.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export { ALLOWED_MIME_TYPES };
