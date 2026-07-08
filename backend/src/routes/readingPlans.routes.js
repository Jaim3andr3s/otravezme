import { Router } from 'express';
import {
  listReadingPlans,
  createReadingPlan,
  deleteReadingPlan,
} from '../controllers/readingPlans.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listReadingPlans);
router.post('/', requireAdmin, createReadingPlan);
router.delete('/:id', requireAdmin, deleteReadingPlan);

export default router;
