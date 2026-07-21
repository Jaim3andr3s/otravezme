import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const challengeSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  goalBooks: z.coerce.number().int().positive('La meta debe ser un número positivo.'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const getChallenges = asyncHandler(async (req, res) => {
  const challenges = await prisma.readingChallenge.findMany({
    orderBy: { startDate: 'asc' },
  });

  const profileId = req.auth?.profileId;

  if (profileId) {
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const readCount = await prisma.readBook.count({
          where: {
            profileId,
            readAt: { gte: challenge.startDate, lte: challenge.endDate },
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
});

export const createChallenge = asyncHandler(async (req, res) => {
  const data = challengeSchema.parse(req.body);
  const challenge = await prisma.readingChallenge.create({ data });
  res.status(201).json(challenge);
});

export const updateChallenge = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = challengeSchema.partial().parse(req.body);
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (data.goalBooks) data.goalBooks = Number(data.goalBooks);
  const challenge = await prisma.readingChallenge.update({ where: { id }, data });
  res.json(challenge);
});

export const deleteChallenge = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.readingChallenge.delete({ where: { id } });
  res.status(204).send();
});
