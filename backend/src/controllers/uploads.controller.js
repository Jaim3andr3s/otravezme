import crypto from 'crypto';
import cloudinary from '../lib/cloudinary.js';
import { ALLOWED_MIME_TYPES } from '../middleware/upload.js';

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
        { public_id: `bibliosuenos/${uniqueId}`, resource_type: isImage ? 'image' : 'raw', type: 'upload' },
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
