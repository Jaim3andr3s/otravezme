import prisma from '../lib/prisma.js';

export async function listPublications(req, res, next) {
  try {
    const { type, section } = req.query;

    if (!type) {
      return res.status(400).json({ message: 'El parámetro "type" es obligatorio (PERIODICO o REVISTA).' });
    }

    const validTypes = ['PERIODICO', 'REVISTA'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo inválido. Debe ser PERIODICO o REVISTA.' });
    }

    const where = { publication: type };
    if (section) {
      where.section = section;
    }

    const articles = await prisma.publicationArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    res.json(articles);
  } catch (err) {
    next(err);
  }
}

export async function createArticle(req, res, next) {
  try {
    const { publication, section, edition, title, author, content, coverImage } = req.body;
    if (!publication || !section || !title || !author || !content) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }
    const article = await prisma.publicationArticle.create({
      data: { publication, section, edition, title, author, content, coverImage },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const article = await prisma.publicationArticle.update({
      where: { id },
      data,
    });
    res.json(article);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Artículo no encontrado.' });
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.publicationArticle.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Artículo no encontrado.' });
    next(err);
  }
}