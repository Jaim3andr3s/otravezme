import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const articleSchema = z.object({
  publication: z.enum(['PERIODICO', 'REVISTA']),
  section: z.string().min(1),
  edition: z.string().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  content: z.string().default(''),
  coverImage: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
});

export const listPublications = asyncHandler(async (req, res) => {
  const { type, section } = req.query;

  if (!type) {
    return res.status(400).json({ message: 'El parámetro "type" es obligatorio (PERIODICO o REVISTA).' });
  }

  const validTypes = ['PERIODICO', 'REVISTA'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Tipo inválido. Debe ser PERIODICO o REVISTA.' });
  }

  const where = { publication: type };
  if (section) where.section = section;

  const articles = await prisma.publicationArticle.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });

  res.json(articles);
});

export const createArticle = asyncHandler(async (req, res) => {
  const data = articleSchema.parse(req.body);
  const article = await prisma.publicationArticle.create({ data });
  res.status(201).json(article);
});

export const updateArticle = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = articleSchema.partial().parse(req.body);
  const article = await prisma.publicationArticle.update({ where: { id }, data });
  res.json(article);
});

export const deleteArticle = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.publicationArticle.delete({ where: { id } });
  res.status(204).send();
});
