import prisma from '../lib/prisma.js';

async function serializeProfile(id) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { favorites: true, read: true },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatar: profile.avatar,
    joinedAt: profile.joinedAt,
    favorites: profile.favorites.map((f) => f.bookId),
    read: profile.read.map((r) => ({ bookId: r.bookId, date: r.readAt })),
  };
}

export async function getProfile(req, res, next) {
  try {
    const id = Number(req.params.id);
    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado.' });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, bio, avatar } = req.body;

    await prisma.profile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
      },
    });

    const profile = await serializeProfile(id);
    res.json({ message: 'Perfil actualizado exitosamente.', profile });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Perfil no encontrado para actualizar.' });
    next(err);
  }
}

export async function setFavorites(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ message: 'La lista de favoritos debe ser un array.' });
    }

    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { profileId: id } }),
      prisma.favorite.createMany({
        data: favorites.map((bookId) => ({ profileId: id, bookId: Number(bookId) })),
        skipDuplicates: true,
      }),
    ]);

    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado para actualizar favoritos.' });
    res.json({ message: 'Lista de favoritos actualizada.', profile });
  } catch (err) {
    next(err);
  }
}

export async function setRead(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { read } = req.body;
    if (!Array.isArray(read)) {
      return res.status(400).json({ message: 'La lista de leídos debe ser un array.' });
    }

    await prisma.$transaction([
      prisma.readBook.deleteMany({ where: { profileId: id } }),
      prisma.readBook.createMany({
        data: read.map((r) => ({
          profileId: id,
          bookId: Number(r.bookId),
          readAt: r.date ? new Date(r.date) : new Date(),
        })),
        skipDuplicates: true,
      }),
    ]);

    const profile = await serializeProfile(id);
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado para actualizar libros leídos.' });
    res.json({ message: 'Lista de libros leídos actualizada.', profile });
  } catch (err) {
    next(err);
  }
}
