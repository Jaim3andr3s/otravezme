import prisma from '../lib/prisma.js';
import { evaluateAndAwardAchievements } from '../lib/achievements.js';

async function serializeProfile(id) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { favorites: true, read: true, achievements: { include: { achievement: true } } },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatar: profile.avatar,
    joinedAt: profile.joinedAt,
    favorites: profile.favorites.map((f) => f.bookId),
    read: profile.read.map((r) => ({ bookId: r.bookId, date: r.readAt })),
    achievements: profile.achievements.map((pa) => ({
      code: pa.achievement.code,
      title: pa.achievement.title,
      description: pa.achievement.description,
      icon: pa.achievement.icon,
      category: pa.achievement.category,
      earnedAt: pa.earnedAt,
    })),
  };
}

export async function getProfile(req, res, next) {
  try {
    const id = Number(req.params.id);
    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado.' });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, bio, avatar } = req.body;

    await prisma.profile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
      },
    });

    const profile = await serializeProfile(id);
    res.json({ message: 'Perfil actualizado exitosamente.', profile });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Perfil no encontrado para actualizar.' });
    next(err);
  }
}

export async function setFavorites(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ message: 'La lista de favoritos debe ser un array.' });
    }

    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { profileId: id } }),
      prisma.favorite.createMany({
        data: favorites.map((bookId) => ({ profileId: id, bookId: Number(bookId) })),
        skipDuplicates: true,
      }),
    ]);

    const newAchievements = await evaluateAndAwardAchievements(id);
    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado para actualizar favoritos.' });
    res.json({ message: 'Lista de favoritos actualizada.', profile, newAchievements });
  } catch (err) {
    next(err);
  }
}

export async function setRead(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { read } = req.body;
    if (!Array.isArray(read)) {
      return res.status(400).json({ message: 'La lista de leídos debe ser un array.' });
    }

    await prisma.$transaction([
      prisma.readBook.deleteMany({ where: { profileId: id } }),
      prisma.readBook.createMany({
        data: read.map((r) => ({
          profileId: id,
          bookId: Number(r.bookId),
          readAt: r.date ? new Date(r.date) : new Date(),
        })),
        skipDuplicates: true,
      }),
    ]);

    const newAchievements = await evaluateAndAwardAchievements(id);
    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado para actualizar libros leídos.' });
    res.json({ message: 'Lista de libros leídos actualizada.', profile, newAchievements });
  } catch (err) {
    next(err);
  }
}

export async function recordGameScore(req, res, next) {
  try {
    const id = Number(req.params.id);
    const game = req.params.game.toUpperCase();
    if (!['TRIVIA', 'MEMORY', 'HANGMAN', 'PUZZLE'].includes(game)) {
      return res.status(400).json({ message: 'Juego inválido.' });
    }

    const { score, won, metadata } = req.body;
    await prisma.gameScore.create({
      data: { profileId: id, game, score: Number(score) || 0, won: won !== false, metadata: metadata ?? undefined },
    });

    const newAchievements = await evaluateAndAwardAchievements(id);
    res.status(201).json({ message: 'Puntaje registrado.', newAchievements });
  } catch (err) {
    if (err.code === 'P2003') return res.status(404).json({ message: 'Perfil no encontrado.' });
    next(err);
  }
}
