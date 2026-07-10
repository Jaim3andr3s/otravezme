import prisma from '../lib/prisma.js';
import { forumPostCreateSchema, forumCommentCreateSchema } from '../validators/forum.schema.js';

const ADMIN_AUTHOR_NAME = 'Biblioteca BiblioSueños';
const ADMIN_AVATAR = null; // el frontend muestra un ícono especial cuando isAdminPost/isAdminComment es true

function serializePost(post, viewerProfileId) {
  return {
    id: post.id,
    profileId: post.profileId,
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    isAdminPost: post.isAdminPost,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    likeCount: post.likes.length,
    likedByMe: viewerProfileId != null && post.likes.some((l) => l.profileId === viewerProfileId),
    commentCount: post.comments.length,
    comments: post.comments
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((c) => ({
        id: c.id,
        profileId: c.profileId,
        authorName: c.authorName,
        authorAvatar: c.authorAvatar,
        isAdminComment: c.isAdminComment,
        content: c.content,
        createdAt: c.createdAt,
      })),
  };
}

export async function listPosts(req, res, next) {
  try {
    const posts = await prisma.forumPost.findMany({
      include: { likes: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts.map((p) => serializePost(p, req.auth?.profileId)));
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const data = forumPostCreateSchema.parse(req.body);
    const { isAdmin, profileId } = req.auth;

    let authorName = ADMIN_AUTHOR_NAME;
    let authorAvatar = ADMIN_AVATAR;
    if (!isAdmin) {
      const profile = await prisma.profile.findUnique({ where: { id: profileId } });
      if (!profile) return res.status(404).json({ message: 'Perfil no encontrado.' });
      authorName = profile.name;
      authorAvatar = profile.avatar;
    }

    const post = await prisma.forumPost.create({
      data: {
        profileId: isAdmin ? null : profileId,
        authorName,
        authorAvatar,
        isAdminPost: isAdmin,
        content: data.content,
        imageUrl: data.imageUrl || null,
      },
      include: { likes: true, comments: true },
    });
    res.status(201).json(serializePost(post, profileId));
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { isAdmin, profileId } = req.auth;

    const post = await prisma.forumPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });
    if (!isAdmin && post.profileId !== profileId) {
      return res.status(403).json({ message: 'Solo puedes eliminar tus propias publicaciones.' });
    }

    await prisma.forumPost.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Publicación no encontrada.' });
    next(err);
  }
}

export async function toggleLike(req, res, next) {
  try {
    const postId = Number(req.params.id);
    const { isAdmin, profileId } = req.auth;
    if (isAdmin) {
      return res.status(400).json({ message: 'El admin no puede dar "me gusta", pero sí puede comentar.' });
    }

    const existing = await prisma.forumLike.findUnique({
      where: { postId_profileId: { postId, profileId } },
    });

    if (existing) {
      await prisma.forumLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.forumLike.create({ data: { postId, profileId } });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: { likes: true, comments: true },
    });
    if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });
    res.json(serializePost(post, profileId));
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const postId = Number(req.params.id);
    const data = forumCommentCreateSchema.parse(req.body);
    const { isAdmin, profileId } = req.auth;

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });

    let authorName = ADMIN_AUTHOR_NAME;
    let authorAvatar = ADMIN_AVATAR;
    if (!isAdmin) {
      const profile = await prisma.profile.findUnique({ where: { id: profileId } });
      if (!profile) return res.status(404).json({ message: 'Perfil no encontrado.' });
      authorName = profile.name;
      authorAvatar = profile.avatar;
    }

    await prisma.forumComment.create({
      data: {
        postId,
        profileId: isAdmin ? null : profileId,
        authorName,
        authorAvatar,
        isAdminComment: isAdmin,
        content: data.content,
      },
    });

    const updatedPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: { likes: true, comments: true },
    });
    res.status(201).json(serializePost(updatedPost, profileId));
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const postId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    const { isAdmin, profileId } = req.auth;

    const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.postId !== postId) return res.status(404).json({ message: 'Comentario no encontrado.' });
    if (!isAdmin && comment.profileId !== profileId) {
      return res.status(403).json({ message: 'Solo puedes eliminar tus propios comentarios.' });
    }

    await prisma.forumComment.delete({ where: { id: commentId } });

    const updatedPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: { likes: true, comments: true },
    });
    if (!updatedPost) return res.status(404).json({ message: 'Publicación no encontrada.' });
    res.json(serializePost(updatedPost, profileId));
  } catch (err) {
    next(err);
  }
}
