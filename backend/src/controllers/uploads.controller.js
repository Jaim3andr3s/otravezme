import crypto from 'crypto';
import cloudinary from '../lib/cloudinary.js';
import { ALLOWED_MIME_TYPES } from '../middleware/upload.js';

// Recibe un único archivo (campo "file", ya en memoria gracias a multer) y
// lo sube a Cloudinary. Le devolvemos al frontend la URL pública definitiva
// (ya en un CDN, no en nuestro propio disco) más la metadata del archivo
// original para mostrar el nombre real en la interfaz.
//
// El nombre en Cloudinary se arma con un id aleatorio (en vez del nombre
// original) para evitar colisiones y problemas con acentos/espacios en el
// nombre que suba el admin. IMPORTANTE sobre extensiones:
// - Para imágenes (resource_type "image"), Cloudinary agrega la extensión
//   sola según el formato detectado — si nosotros también la ponemos en el
//   public_id, queda duplicada (ej. "foto.jpg.jpg"), así que la omitimos.
// - Para PDF/Word (resource_type "raw"), Cloudinary usa el public_id tal
//   cual en la URL, sin agregar nada — ahí sí hay que incluir la extensión
//   nosotros, o el visor del frontend no sabría qué tipo de archivo es.
export async function createUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo.' });
  }

  const ext = ALLOWED_MIME_TYPES[req.file.mimetype] || '';
  const isImage = req.file.mimetype.startsWith('image/');
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${isImage ? '' : ext}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `bibliosuenos/${uniqueId}`,
          resource_type: isImage ? 'image' : 'raw',
          type: 'upload',
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    return res.status(201).json({
      url: result.secure_url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error subiendo archivo a Cloudinary:', error);
    return res.status(502).json({ message: 'No se pudo subir el archivo. Intenta de nuevo en unos segundos.' });
  }
}
