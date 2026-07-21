import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { eventCreateSchema, eventUpdateSchema } from '../validators/events.schema.js';
import { parsePagination, paginatedResponse } from '../lib/paginate.js';

export const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query);
  const [events, total] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: 'asc' }, skip, take }),
    prisma.event.count(),
  ]);
  res.json(paginatedResponse(events, total, { page, limit }));
});

export const createEvent = asyncHandler(async (req, res) => {
  const data = eventCreateSchema.parse(req.body);
  const event = await prisma.event.create({
    data: { ...data, imageUrl: data.imageUrl || null },
  });
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = eventUpdateSchema.parse(req.body);
  if (data.imageUrl !== undefined) data.imageUrl = data.imageUrl || null;

  const event = await prisma.event.update({ where: { id }, data });
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});
