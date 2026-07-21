import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { readingPlanCreateSchema } from '../validators/plans.schema.js';

function serializePlan(plan) {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    level: plan.level,
    durationWeeks: plan.durationWeeks,
    documentUrl: plan.documentUrl,
    books: plan.books.map((pb) => ({ bookId: pb.bookId, week: pb.weekNumber, note: pb.note })),
  };
}

export const listReadingPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.readingPlan.findMany({
    include: { books: { orderBy: { weekNumber: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(plans.map(serializePlan));
});

export const createReadingPlan = asyncHandler(async (req, res) => {
  const data = readingPlanCreateSchema.parse(req.body);
  const plan = await prisma.readingPlan.create({
    data: {
      title: data.title,
      description: data.description,
      level: data.level,
      durationWeeks: data.durationWeeks,
      documentUrl: data.documentUrl || null,
      books: { create: data.books.map((b) => ({ bookId: b.bookId, weekNumber: b.week, note: b.note })) },
    },
    include: { books: true },
  });
  res.status(201).json(serializePlan(plan));
});

export const updateReadingPlan = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = readingPlanCreateSchema.parse(req.body);

  await prisma.$transaction([
    prisma.readingPlanBook.deleteMany({ where: { planId: id } }),
    prisma.readingPlan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        durationWeeks: data.durationWeeks,
        documentUrl: data.documentUrl || null,
        books: { create: data.books.map((b) => ({ bookId: b.bookId, weekNumber: b.week, note: b.note })) },
      },
    }),
  ]);

  const plan = await prisma.readingPlan.findUnique({ where: { id }, include: { books: true } });
  res.json(serializePlan(plan));
});

export const deleteReadingPlan = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.readingPlan.delete({ where: { id } });
  res.status(204).send();
});
