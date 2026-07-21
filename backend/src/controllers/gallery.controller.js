import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { parsePagination, paginatedResponse } from '../lib/paginate.js';

export const listGallery = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query);
  const [images, total] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.galleryImage.count(),
  ]);
  res.json(paginatedResponse(images, total, { page, limit }));
});

export const createGalleryImage = asyncHandler(async (req, res) => {
  const { url, caption } = req.body;
  if (!url) return res.status(400).json({ message: 'URL de imagen requerida.' });

  const image = await prisma.galleryImage.create({ data: { url, caption } });
  res.status(201).json(image);
});

export const updateGalleryImage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { url, caption } = req.body;
  const image = await prisma.galleryImage.update({ where: { id }, data: { url, caption } });
  res.json(image);
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.galleryImage.delete({ where: { id } });
  res.status(204).send();
});
