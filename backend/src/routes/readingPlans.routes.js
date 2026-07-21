import { Router } from 'express';
import {
  listReadingPlans,
  createReadingPlan,
  updateReadingPlan,
  deleteReadingPlan,
} from '../controllers/readingPlans.controller.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const router = Router();

router.get('/', listReadingPlans);
router.post('/', requireAdmin, createReadingPlan);
router.put('/:id', requireAdmin, validateId(), updateReadingPlan);
router.delete('/:id', requireAdmin, validateId(), deleteReadingPlan);

export default router;
