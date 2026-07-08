import prisma from '../lib/prisma.js';
import { bookCreateSchema, bookUpdateSchema } from '../validators/books.schema.js';

export async function listBooks(req, res, next) {
  try {
    const books = await prisma.book.findMany({ orderBy: { dateAdded: 'desc' } });
    res.json(books);
  } catch (err) {
    next(err);
  }
}

export async function getBook(req, res, next) {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return res.status(404).json({ message: 'Libro no encontrado.' });
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function createBook(req, res, next) {
  try {
    const data = bookCreateSchema.parse(req.body);
    const book = await prisma.book.create({
      data: { ...data, readOnlineUrl: data.readOnlineUrl || null },
    });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = bookUpdateSchema.parse(req.body);
    if (data.readOnlineUrl !== undefined) data.readOnlineUrl = data.readOnlineUrl || null;

    const book = await prisma.book.update({ where: { id }, data });
    res.json({ message: 'Libro actualizado exitosamente.', book });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Libro no encontrado para actualizar.' });
    next(err);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.json({ message: 'Libro eliminado exitosamente.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Libro no encontrado para eliminar.' });
    next(err);
  }
}

export async function voteBook(req, res, next) {
  try {
    const id = Number(req.params.id);
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
    res.json({ message: 'Voto registrado exitosamente.', book: updated });
  } catch (err) {
    next(err);
  }
}
