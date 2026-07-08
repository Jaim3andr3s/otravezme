import prisma from '../lib/prisma.js';

/**
 * GET /publications?type=PERIODICO|REVISTA&section=...
 */
export async function listPublications(req, res, next) {
  try {
    const { type, section } = req.query;

    // Validar que el tipo sea obligatorio
    if (!type) {
      return res.status(400).json({ message: 'El parámetro "type" es obligatorio (PERIODICO o REVISTA).' });
    }

    const validTypes = ['PERIODICO', 'REVISTA'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo inválido. Debe ser PERIODICO o REVISTA.' });
    }

    // Construir filtros
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