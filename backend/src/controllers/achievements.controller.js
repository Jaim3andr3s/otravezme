import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const listAchievements = asyncHandler(async (req, res) => {
  const achievements = await prisma.achievement.findMany({ orderBy: { id: 'asc' } });
  res.json(achievements);
});
