import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireUser } from '../middleware/requireUser.js';
import { requireAnyAuth } from '../middleware/requireAnyAuth.js';
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

// Listar requiere sesión (lector ve su propia entrega; admin ve totales).
router.get('/', requireAnyAuth, listActivities);

// Solo el admin publica, edita o borra actividades.
router.post('/', requireAdmin, createActivity);
router.put('/:id', requireAdmin, updateActivity);
router.delete('/:id', requireAdmin, deleteActivity);

// Solo el admin revisa el listado completo de entregas y las califica.
router.get('/:id/submissions', requireAdmin, listSubmissions);
router.put('/:id/submissions/:submissionId/review', requireAdmin, reviewSubmission);

// Solo un lector logueado entrega su propia actividad.
router.post('/:id/submit', requireUser, submitActivity);

export default router;
