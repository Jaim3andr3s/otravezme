import { Router } from 'express';
import { listEvents, createEvent, deleteEvent } from '../controllers/events.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listEvents);
router.post('/', requireAdmin, createEvent);
router.delete('/:id', requireAdmin, deleteEvent);

export default router;
