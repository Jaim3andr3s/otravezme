import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { parsePagination, paginatedResponse } from '../lib/paginate.js';
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
    submissionCount: activity._count?.submissions ?? activity.submissions?.length ?? 0,
  };

  if (viewerAuth?.isAdmin) {
    return {
      ...base,
      reviewedCount: (activity.submissions || []).filter((s) => s.status === 'REVISADA').length,
    };
  }

  const mine = (activity.submissions || []).find((s) => s.profileId === viewerAuth?.profileId);
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

export const listActivities = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = parsePagination(req.query, 50, 20);
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      include: { submissions: true, _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.activity.count(),
  ]);
  res.json(paginatedResponse(activities.map((a) => serializeActivity(a, req.auth)), total, { page, limit }));
});

export const createActivity = asyncHandler(async (req, res) => {
  const data = activityCreateSchema.parse(req.body);
  const activity = await prisma.activity.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || null,
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
    },
    include: { submissions: true, _count: { select: { submissions: true } } },
  });
  res.status(201).json(serializeActivity(activity, req.auth));
});

export const updateActivity = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = activityUpdateSchema.parse(req.body);
  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ?? undefined,
      attachmentUrl: data.attachmentUrl === '' ? null : data.attachmentUrl,
      attachmentName: data.attachmentName === '' ? null : data.attachmentName,
    },
    include: { submissions: true, _count: { select: { submissions: true } } },
  });
  res.json(serializeActivity(activity, req.auth));
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.activity.delete({ where: { id } });
  res.status(204).send();
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const activityId = req.params.id;
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
});

export const submitActivity = asyncHandler(async (req, res) => {
  const activityId = req.params.id;
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
    create: { activityId, profileId, content: data.content || null, fileUrl: data.fileUrl || null, fileName: data.fileName || null },
    update: { content: data.content || null, fileUrl: data.fileUrl || null, fileName: data.fileName || null },
  });

  res.status(existing ? 200 : 201).json(submission);
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  const submissionId = req.params.submissionId;
  const data = activityReviewSchema.parse(req.body);
  const submission = await prisma.activitySubmission.update({
    where: { id: submissionId },
    data: { status: data.status, feedback: data.feedback || null },
  });
  res.json(submission);
});
