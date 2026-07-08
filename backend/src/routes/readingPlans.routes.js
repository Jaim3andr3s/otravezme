import { Router } from 'express';
import {
  listReadingPlans,
  createReadingPlan,
  updateReadingPlan,
  deleteReadingPlan,
} from '../controllers/readingPlans.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listReadingPlans);
router.post('/', requireAdmin, createReadingPlan);
router.put('/:id', requireAdmin, updateReadingPlan);
router.delete('/:id', requireAdmin, deleteReadingPlan);

export default router;
