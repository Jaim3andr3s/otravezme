import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { bookCreateSchema, bookUpdateSchema } from '../validators/books.schema.js';
import { parsePagination, paginatedResponse } from '../lib/paginate.js';

export const listBooks = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query);
  const [books, total] = await Promise.all([
    prisma.book.findMany({ orderBy: { dateAdded: 'desc' }, skip, take }),
    prisma.book.count(),
  ]);
  res.json(paginatedResponse(books, total, { page, limit }));
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book) return res.status(404).json({ message: 'Libro no encontrado.' });
  res.json(book);
});

export const createBook = asyncHandler(async (req, res) => {
  const data = bookCreateSchema.parse(req.body);
  const book = await prisma.book.create({
    data: { ...data, readOnlineUrl: data.readOnlineUrl || null },
  });
  res.status(201).json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = bookUpdateSchema.parse(req.body);
  if (data.readOnlineUrl !== undefined) data.readOnlineUrl = data.readOnlineUrl || null;

  if (data.isBookOfMonth === true) {
    await prisma.$transaction([
      prisma.book.updateMany({
        where: { isBookOfMonth: true, NOT: { id } },
        data: { isBookOfMonth: false },
      }),
      prisma.book.update({ where: { id }, data }),
    ]);
    const updatedBook = await prisma.book.findUnique({ where: { id } });
    return res.json(updatedBook);
  }

  const book = await prisma.book.update({ where: { id }, data });
  res.json(book);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.book.delete({ where: { id } });
  res.status(204).send();
});

export const voteBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { type } = req.body;
  if (type !== 'up' && type !== 'down') {
    return res.status(400).json({ message: 'Tipo de voto inválido. Debe ser "up" o "down".' });
  }

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return res.status(404).json({ message: 'Libro no encontrado para votar.' });

  const score = type === 'up' ? 5 : 1;
  const newReviews = book.reviews + 1;
  const rawRating = (book.rating * book.reviews + score) / newReviews;
  const newRating = Math.round(Math.min(5, Math.max(1, rawRating)) * 10) / 10;

  const updated = await prisma.book.update({
      where: { id },
      data: { rating: newRating, reviews: newReviews },
    });
    res.json(updated);
});
