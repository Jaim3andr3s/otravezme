import { Router } from 'express';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/events.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listEvents);
router.post('/', requireAdmin, createEvent);
router.put('/:id', requireAdmin, updateEvent);
router.delete('/:id', requireAdmin, deleteEvent);

export default router;
