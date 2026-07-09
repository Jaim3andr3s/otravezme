import prisma from '../lib/prisma.js';

export async function getChallenges(req, res, next) {
  try {
    const challenges = await prisma.readingChallenge.findMany({
      orderBy: { startDate: 'asc' },
    });

    const profileId = req.profileId;

    if (profileId) {
      const challengesWithProgress = await Promise.all(
        challenges.map(async (challenge) => {
          const readCount = await prisma.readBook.count({
            where: {
              profileId: profileId,
              readAt: {
                gte: challenge.startDate,
                lte: challenge.endDate,
              },
            },
          });

          return {
            ...challenge,
            progress: Math.min(readCount, challenge.goalBooks),
            goal: challenge.goalBooks,
            completed: readCount >= challenge.goalBooks,
          };
        })
      );
      res.json(challengesWithProgress);
    } else {
      res.json(
        challenges.map((c) => ({
          ...c,
          progress: null,
          goal: c.goalBooks,
          completed: false,
        }))
      );
    }
  } catch (err) {
    next(err);
  }
}

export async function createChallenge(req, res, next) {
  try {
    const { title, description, goalBooks, startDate, endDate } = req.body;
    if (!title || !description || !goalBooks || !startDate || !endDate) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }
    const challenge = await prisma.readingChallenge.create({
      data: {
        title,
        description,
        goalBooks: parseInt(goalBooks, 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(challenge);
  } catch (err) {
    next(err);
  }
}

export async function updateChallenge(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.goalBooks) data.goalBooks = parseInt(data.goalBooks, 10);
    const challenge = await prisma.readingChallenge.update({
      where: { id },
      data,
    });
    res.json(challenge);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Reto no encontrado.' });
    next(err);
  }
}

export async function deleteChallenge(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.readingChallenge.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Reto no encontrado.' });
    next(err);
  }
}