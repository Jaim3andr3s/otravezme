import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ACHIEVEMENT_DEFINITIONS } from '../src/lib/achievements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function readLegacy(file) {
  const filePath = path.join(__dirname, 'legacy-data', file);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function resyncSequence(table) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
  );
}

async function seedBooks() {
  const legacyBooks = readLegacy('content.json');

  for (const b of legacyBooks) {
    await prisma.book.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        cover: b.cover,
        description: b.description,
        status: b.status === 'Prestado' ? 'PRESTADO' : 'DISPONIBLE',
        ageRange: b.ageRange,
        isStaffPick: Boolean(b.isStaffPick),
        readOnlineUrl: b.readOnlineUrl && b.readOnlineUrl !== '#' ? b.readOnlineUrl : null,
        rating: b.rating ?? 0,
        reviews: b.reviews ?? 0,
        dateAdded: b.dateAdded ? new Date(b.dateAdded) : new Date(),
      },
    });
  }

  if (legacyBooks.length > 0) await resyncSequence('Book');
  console.log(`Migrados ${legacyBooks.length} libros.`);
  return legacyBooks;
}

async function seedProfile() {
  const [legacyProfile] = readLegacy('profiles.json');
  if (!legacyProfile) return;

  const profile = await prisma.profile.upsert({
    where: { id: legacyProfile.id },
    update: {},
    create: {
      id: legacyProfile.id,
      name: legacyProfile.name,
      email: legacyProfile.email ?? null,
      bio: legacyProfile.bio,
      avatar: legacyProfile.avatar,
      joinedAt: legacyProfile.joinedAt ? new Date(legacyProfile.joinedAt) : new Date(),
    },
  });
  await resyncSequence('Profile');

  for (const r of legacyProfile.read ?? []) {
    await prisma.readBook.upsert({
      where: { profileId_bookId: { profileId: profile.id, bookId: r.bookId } },
      update: {},
      create: { profileId: profile.id, bookId: r.bookId, readAt: r.date ? new Date(r.date) : new Date() },
    });
  }

  for (const bookId of legacyProfile.favorites ?? []) {
    await prisma.favorite.upsert({
      where: { profileId_bookId: { profileId: profile.id, bookId } },
      update: {},
      create: { profileId: profile.id, bookId },
    });
  }

  console.log(`Migrado el perfil "${profile.name}".`);
}

async function seedExampleEvents() {
  const eventCount = await prisma.event.count();
  if (eventCount > 0) return;

  await prisma.event.createMany({
    data: [
      {
        title: 'Club de Lectura: Realismo Mágico',
        description: 'Conversamos sobre "Cien Años de Soledad" y el legado de García Márquez.',
        type: 'CLUB_LECTURA',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Cuentacuentos Infantil',
        description: 'Una tarde de cuentos para los más pequeños de la comunidad.',
        type: 'CUENTACUENTOS',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('Creados eventos de ejemplo (no había eventos reales que migrar).');
}

async function seedExamplePlan(legacyBooks) {
  const planCount = await prisma.readingPlan.count();
  if (planCount > 0 || legacyBooks.length < 2) return;

  await prisma.readingPlan.create({
    data: {
      title: 'Iniciación a la Literatura Latinoamericana',
      description: 'Un recorrido de cuatro semanas por autores esenciales de la región.',
      level: 'Intermedio',
      durationWeeks: 4,
      books: {
        create: [
          { bookId: legacyBooks[0].id, weekNumber: 1 },
          { bookId: legacyBooks[1].id, weekNumber: 2 },
        ],
      },
    },
  });
  console.log('Creado plan de lectura de ejemplo (no existía readingPlan.json que migrar).');
}

async function seedAdmin() {
  const username = 'admin';
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) return;

  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_SEED_PASSWORD no está definido en el .env; es requerido para crear el admin inicial.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({ data: { username, passwordHash } });
  console.log(`Admin inicial creado: usuario "${username}".`);
}

async function seedAchievements() {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { code: def.code },
      update: { title: def.title, description: def.description, icon: def.icon, category: def.category },
      create: {
        code: def.code,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
      },
    });
  }
  console.log(`Sincronizadas ${ACHIEVEMENT_DEFINITIONS.length} definiciones de insignias.`);
}

async function main() {
  const legacyBooks = await seedBooks();
  await seedProfile();
  await seedExampleEvents();
  await seedExamplePlan(legacyBooks);
  await seedAdmin();
  await seedAchievements();
  console.log('Seed completado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
