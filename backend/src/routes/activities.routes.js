import { Router } from 'express';
import { requireAdmin, requireUser, requireAnyAuth } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  listSubmissions,
  submitActivity,
  reviewSubmission,
} from '../controllers/activities.controller.js';

const router = Router();

router.get('/', requireAnyAuth, listActivities);
router.post('/', requireAdmin, createActivity);
router.put('/:id', requireAdmin, validateId(), updateActivity);
router.delete('/:id', requireAdmin, validateId(), deleteActivity);

router.get('/:id/submissions', requireAdmin, validateId(), listSubmissions);
router.put('/:id/submissions/:submissionId/review', requireAdmin, validateId('submissionId'), reviewSubmission);

router.post('/:id/submit', requireUser, validateId(), submitActivity);

export default router;
