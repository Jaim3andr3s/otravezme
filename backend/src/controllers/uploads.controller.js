// Recibe un único archivo (campo "file") ya guardado en disco por el
// middleware `upload` (multer) y devuelve la info que el frontend necesita
// para referenciarlo: la URL pública relativa (servida como estática desde
// /uploads en app.js) más metadata del archivo original.
export async function createUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo.' });
  }

  const { filename, originalname, mimetype, size } = req.file;

  return res.status(201).json({
    url: `/uploads/${filename}`,
    originalName: originalname,
    mimeType: mimetype,
    size,
  });
}
