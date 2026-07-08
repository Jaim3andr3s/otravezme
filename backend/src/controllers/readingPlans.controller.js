import prisma from '../lib/prisma.js';
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

export async function listReadingPlans(req, res, next) {
  try {
    const plans = await prisma.readingPlan.findMany({
      include: { books: { orderBy: { weekNumber: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plans.map(serializePlan));
  } catch (err) {
    next(err);
  }
}

export async function createReadingPlan(req, res, next) {
  try {
    const data = readingPlanCreateSchema.parse(req.body);
    const plan = await prisma.readingPlan.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        durationWeeks: data.durationWeeks,
        documentUrl: data.documentUrl || null,
        books: {
          create: data.books.map((b) => ({ bookId: b.bookId, weekNumber: b.week, note: b.note })),
        },
      },
      include: { books: true },
    });
    res.status(201).json(serializePlan(plan));
  } catch (err) {
    next(err);
  }
}

export async function updateReadingPlan(req, res, next) {
  try {
    const id = Number(req.params.id);
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
          books: {
            create: data.books.map((b) => ({ bookId: b.bookId, weekNumber: b.week, note: b.note })),
          },
        },
      }),
    ]);

    const plan = await prisma.readingPlan.findUnique({ where: { id }, include: { books: true } });
    res.json({ message: 'Plan de lectura actualizado exitosamente.', plan: serializePlan(plan) });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Plan de lectura no encontrado para actualizar.' });
    next(err);
  }
}

export async function deleteReadingPlan(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.readingPlan.delete({ where: { id } });
    res.json({ message: 'Plan de lectura eliminado exitosamente.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Plan de lectura no encontrado para eliminar.' });
    next(err);
  }
}
