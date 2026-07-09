import prisma from '../lib/prisma.js';

export async function listAchievements(req, res, next) {
  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
    res.json(achievements);
  } catch (err) {
    next(err);
  }
}
