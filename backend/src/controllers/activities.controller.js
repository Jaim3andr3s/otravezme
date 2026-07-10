import prisma from '../lib/prisma.js';
import {
  activityCreateSchema,
  activityUpdateSchema,
  activitySubmissionSchema,
  activityReviewSchema,
} from '../validators/activities.schema.js';

function serializeActivity(activity, viewerAuth) {
  const base = {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    dueDate: activity.dueDate,
    attachmentUrl: activity.attachmentUrl,
    attachmentName: activity.attachmentName,
    createdAt: activity.createdAt,
    submissionCount: activity.submissions.length,
  };

  if (viewerAuth?.isAdmin) {
    return {
      ...base,
      reviewedCount: activity.submissions.filter((s) => s.status === 'REVISADA').length,
    };
  }

  const mine = activity.submissions.find((s) => s.profileId === viewerAuth?.profileId);
  return {
    ...base,
    mySubmission: mine
      ? {
          id: mine.id,
          content: mine.content,
          fileUrl: mine.fileUrl,
          fileName: mine.fileName,
          status: mine.status,
          feedback: mine.feedback,
          submittedAt: mine.submittedAt,
          updatedAt: mine.updatedAt,
        }
      : null,
  };
}

export async function listActivities(req, res, next) {
  try {
    const activities = await prisma.activity.findMany({
      include: { submissions: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities.map((a) => serializeActivity(a, req.auth)));
  } catch (err) {
    next(err);
  }
}

export async function createActivity(req, res, next) {
  try {
    const data = activityCreateSchema.parse(req.body);
    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
        attachmentUrl: data.attachmentUrl || null,
        attachmentName: data.attachmentName || null,
      },
      include: { submissions: true },
    });
    res.status(201).json(serializeActivity(activity, req.auth));
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = activityUpdateSchema.parse(req.body);
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ?? undefined,
        attachmentUrl: data.attachmentUrl === '' ? null : data.attachmentUrl,
        attachmentName: data.attachmentName === '' ? null : data.attachmentName,
      },
      include: { submissions: true },
    });
    res.json(serializeActivity(activity, req.auth));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Actividad no encontrada.' });
    next(err);
  }
}

export async function deleteActivity(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.activity.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Actividad no encontrada.' });
    next(err);
  }
}

// Lista completa de entregas de una actividad, solo para el admin (para
// revisar el trabajo de cada lector).
export async function listSubmissions(req, res, next) {
  try {
    const activityId = Number(req.params.id);
    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId },
      include: { profile: { select: { id: true, name: true, avatar: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(
      submissions.map((s) => ({
        id: s.id,
        profile: s.profile,
        content: s.content,
        fileUrl: s.fileUrl,
        fileName: s.fileName,
        status: s.status,
        feedback: s.feedback,
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
      }))
    );
  } catch (err) {
    next(err);
  }
}

// El lector entrega (o vuelve a entregar mientras no haya sido revisada) su
// trabajo para una actividad: texto libre y/o un archivo (foto, PDF o Word).
export async function submitActivity(req, res, next) {
  try {
    const activityId = Number(req.params.id);
    const { profileId } = req.auth;
    const data = activitySubmissionSchema.parse(req.body);

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) return res.status(404).json({ message: 'Actividad no encontrada.' });

    const existing = await prisma.activitySubmission.findUnique({
      where: { activityId_profileId: { activityId, profileId } },
    });

    if (existing && existing.status === 'REVISADA') {
      return res.status(400).json({ message: 'Esta entrega ya fue revisada por el admin y no se puede modificar.' });
    }

    const submission = await prisma.activitySubmission.upsert({
      where: { activityId_profileId: { activityId, profileId } },
      create: {
        activityId,
        profileId,
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
      },
      update: {
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
      },
    });

    res.status(existing ? 200 : 201).json(submission);
  } catch (err) {
    next(err);
  }
}

// Admin marca una entrega como revisada y opcionalmente deja retroalimentación.
export async function reviewSubmission(req, res, next) {
  try {
    const submissionId = Number(req.params.submissionId);
    const data = activityReviewSchema.parse(req.body);
    const submission = await prisma.activitySubmission.update({
      where: { id: submissionId },
      data: { status: data.status, feedback: data.feedback || null },
    });
    res.json(submission);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Entrega no encontrada.' });
    next(err);
  }
}
