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