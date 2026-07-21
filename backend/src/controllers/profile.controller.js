import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { evaluateAndAwardAchievements } from '../lib/achievements.js';

async function awardPlanDiploma(profileId, planId) {
  const plan = await prisma.readingPlan.findUnique({
    where: { id: planId },
    include: { books: true },
  });
  if (!plan) return null;

  const existing = await prisma.diploma.findFirst({
    where: { profileId, title: plan.title, type: 'PLAN' },
  });
  if (existing) return null;

  const bookIds = plan.books.map(b => b.bookId);
  const readBooks = await prisma.readBook.findMany({
    where: { profileId, bookId: { in: bookIds } },
  });
  const readBookIds = readBooks.map(r => r.bookId);
  if (!bookIds.every(id => readBookIds.includes(id))) return null;

  const diploma = await prisma.diploma.create({
    data: { profileId, title: `Plan completado: ${plan.title}`, type: 'PLAN' },
  });
  return diploma;
}

async function awardChallengeDiploma(profileId, challengeId) {
  const challenge = await prisma.readingChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return null;

  const existing = await prisma.diploma.findFirst({
    where: { profileId, title: challenge.title, type: 'CHALLENGE' },
  });
  if (existing) return null;

  const readCount = await prisma.readBook.count({
    where: { profileId, readAt: { gte: challenge.startDate, lte: challenge.endDate } },
  });
  if (readCount < challenge.goalBooks) return null;

  const diploma = await prisma.diploma.create({
    data: { profileId, title: `Reto completado: ${challenge.title}`, type: 'CHALLENGE' },
  });
  return diploma;
}

async function checkAndAwardDiplomas(profileId) {
  const awarded = [];
  const plans = await prisma.readingPlan.findMany({ include: { books: true } });
  for (const plan of plans) {
    const diploma = await awardPlanDiploma(profileId, plan.id);
    if (diploma) awarded.push(diploma);
  }
  const challenges = await prisma.readingChallenge.findMany();
  for (const challenge of challenges) {
    const diploma = await awardChallengeDiploma(profileId, challenge.id);
    if (diploma) awarded.push(diploma);
  }
  return awarded;
}

async function serializeProfile(id) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      favorites: true,
      read: true,
      achievements: { include: { achievement: true } },
      diplomas: { orderBy: { issuedAt: 'desc' } },
    },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatar: profile.avatar,
    joinedAt: profile.joinedAt,
    authProvider: profile.authProvider,
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
    diplomas: profile.diplomas.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      issuedAt: d.issuedAt,
    })),
  };
}

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await serializeProfile(req.profileId);
  if (!profile) return res.status(404).json({ message: 'Perfil no encontrado.' });
  res.json(profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const id = req.profileId;
  const { name, bio, avatar } = req.body;

  await prisma.profile.update({
    where: { id },
    data: { ...(name && { name }), ...(bio && { bio }), ...(avatar && { avatar }) },
  });

  const profile = await serializeProfile(id);
  res.json({ message: 'Perfil actualizado exitosamente.', profile });
});

export const setFavorites = asyncHandler(async (req, res) => {
  const id = req.profileId;
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
  res.json({ message: 'Lista de favoritos actualizada.', profile, newAchievements });
});

export const setRead = asyncHandler(async (req, res) => {
  const id = req.profileId;
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
  const newDiplomas = await checkAndAwardDiplomas(id);
  const profile = await serializeProfile(id);
  res.json({ message: 'Lista de libros leídos actualizada.', profile, newAchievements, newDiplomas });
});

export const recordGameScore = asyncHandler(async (req, res) => {
  const id = req.profileId;
  const game = req.params.game.toUpperCase();

  if (!['TRIVIA', 'MEMORY', 'HANGMAN', 'PUZZLE', 'WORDSEARCH', 'CROSSWORD'].includes(game)) {
    return res.status(400).json({ message: 'Juego inválido.' });
  }

  const { score, won, metadata } = req.body;
  await prisma.gameScore.create({
    data: { profileId: id, game, score: Number(score) || 0, won: won !== false, metadata: metadata ?? undefined },
  });

  const newAchievements = await evaluateAndAwardAchievements(id);
  res.status(201).json({ message: 'Puntaje registrado.', newAchievements });
});

export const getDiplomas = asyncHandler(async (req, res) => {
  const profileId = req.profileId;
  const diplomas = await prisma.diploma.findMany({
    where: { profileId },
    orderBy: { issuedAt: 'desc' },
  });
  res.json(diplomas);
});
