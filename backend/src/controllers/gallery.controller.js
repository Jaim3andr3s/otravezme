import prisma from '../lib/prisma.js';

export async function listGallery(req, res, next) {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

export async function createGalleryImage(req, res, next) {
  try {
    const { url, caption } = req.body;
    if (!url) return res.status(400).json({ message: 'URL de imagen requerida.' });

    const image = await prisma.galleryImage.create({
      data: { url, caption },
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { url, caption } = req.body;
    const image = await prisma.galleryImage.update({
      where: { id },
      data: { url, caption },
    });
    res.json(image);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Imagen no encontrada.' });
    next(err);
  }
}

export async function deleteGalleryImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.galleryImage.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Imagen no encontrada.' });
    next(err);
  }
}