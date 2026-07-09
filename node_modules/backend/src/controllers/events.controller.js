import prisma from '../lib/prisma.js';
import { eventCreateSchema, eventUpdateSchema } from '../validators/events.schema.js';

export async function listEvents(req, res, next) {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const data = eventCreateSchema.parse(req.body);
    const event = await prisma.event.create({
      data: { ...data, imageUrl: data.imageUrl || null },
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = eventUpdateSchema.parse(req.body);
    if (data.imageUrl !== undefined) data.imageUrl = data.imageUrl || null;

    const event = await prisma.event.update({ where: { id }, data });
    res.json({ message: 'Evento actualizado exitosamente.', event });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Evento no encontrado para actualizar.' });
    next(err);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Evento eliminado exitosamente.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Evento no encontrado para eliminar.' });
    next(err);
  }
}
