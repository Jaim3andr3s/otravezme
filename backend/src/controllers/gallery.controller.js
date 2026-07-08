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