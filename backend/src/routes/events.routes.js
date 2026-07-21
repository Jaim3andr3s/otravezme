import { Router } from 'express';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/events.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', listEvents);
router.post('/', requireAdmin, createEvent);
router.put('/:id', requireAdmin, validateId(), updateEvent);
router.delete('/:id', requireAdmin, validateId(), deleteEvent);

export default router;
