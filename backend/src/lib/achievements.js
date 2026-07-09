import prisma from './prisma.js';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    code: 'PRIMER_LIBRO_LEIDO',
    title: 'Primer Vistazo',
    description: 'Marca tu primer libro como leído.',
    icon: 'BookOpenCheck',
    category: 'LECTURA',
    check: (stats) => stats.readCount >= 1,
  },
  {
    code: 'LECTOR_FRECUENTE',
    title: 'Bibliófilo en Ascenso',
    description: 'Lee 5 libros del catálogo.',
    icon: 'BookMarked',
    category: 'LECTURA',
    check: (stats) => stats.readCount >= 5,
  },
  {
    code: 'MAESTRO_LECTOR',
    title: 'Maestro Lector',
    description: 'Lee 10 libros del catálogo.',
    icon: 'Crown',
    category: 'LECTURA',
    check: (stats) => stats.readCount >= 10,
  },
  {
    code: 'COLECCIONISTA',
    title: 'Coleccionista',
    description: 'Marca 5 libros como favoritos.',
    icon: 'Heart',
    category: 'LECTURA',
    check: (stats) => stats.favoriteCount >= 5,
  },
  {
    code: 'TRIVIA_NOVATA',
    title: 'Trivia Novata',
    description: 'Completa tu primera partida de trivia literaria.',
    icon: 'Brain',
    category: 'JUEGO',
    check: (stats) => stats.gamesPlayed.TRIVIA >= 1,
  },
  {
    code: 'CEREBRITO_LITERARIO',
    title: 'Cerebrito Literario',
    description: 'Consigue puntaje perfecto en una trivia.',
    icon: 'Sparkles',
    category: 'JUEGO',
    check: (stats) => stats.triviaPerfect >= 1,
  },
  {
    code: 'MEMORIA_DE_ELEFANTE',
    title: 'Memoria de Elefante',
    description: 'Completa el memorama de portadas.',
    icon: 'Grid3x3',
    category: 'JUEGO',
    check: (stats) => stats.gamesPlayed.MEMORY >= 1,
  },
  {
    code: 'VERDUGO_PACIENTE',
    title: 'Verdugo Paciente',
    description: 'Gana una partida de ahorcado literario.',
    icon: 'Type',
    category: 'JUEGO',
    check: (stats) => stats.gamesWon.HANGMAN >= 1,
  },
  {
    code: 'ARMADOR_DE_HISTORIAS',
    title: 'Armador de Historias',
    description: 'Resuelve el rompecabezas de una portada.',
    icon: 'Puzzle',
    category: 'JUEGO',
    check: (stats) => stats.gamesWon.PUZZLE >= 1,
  },
  {
    code: 'EXPLORADOR_DE_JUEGOS',
    title: 'Explorador de Juegos',
    description: 'Juega al menos una vez cada uno de los 4 juegos.',
    icon: 'Compass',
    category: 'JUEGO',
    check: (stats) =>
      stats.gamesPlayed.TRIVIA >= 1 &&
      stats.gamesPlayed.MEMORY >= 1 &&
      stats.gamesPlayed.HANGMAN >= 1 &&
      stats.gamesPlayed.PUZZLE >= 1,
  },
];

async function computeStats(profileId) {
  const [readCount, favoriteCount, scores] = await Promise.all([
    prisma.readBook.count({ where: { profileId } }),
    prisma.favorite.count({ where: { profileId } }),
    prisma.gameScore.findMany({ where: { profileId } }),
  ]);

  const gamesPlayed = { TRIVIA: 0, MEMORY: 0, HANGMAN: 0, PUZZLE: 0 };
  const gamesWon = { TRIVIA: 0, MEMORY: 0, HANGMAN: 0, PUZZLE: 0 };
  let triviaPerfect = 0;

  for (const s of scores) {
    gamesPlayed[s.game] += 1;
    if (s.won) gamesWon[s.game] += 1;
    if (s.game === 'TRIVIA' && s.metadata?.perfect) triviaPerfect += 1;
  }

  return { readCount, favoriteCount, gamesPlayed, gamesWon, triviaPerfect };
}

export async function evaluateAndAwardAchievements(profileId) {
  const stats = await computeStats(profileId);
  const earned = ACHIEVEMENT_DEFINITIONS.filter((def) => def.check(stats));
  if (earned.length === 0) return [];

  const existing = await prisma.achievement.findMany({
    where: { code: { in: earned.map((e) => e.code) } },
  });
  const existingByCode = new Map(existing.map((a) => [a.code, a]));

  const newlyAwarded = [];
  for (const def of earned) {
    const achievement = existingByCode.get(def.code);
    if (!achievement) continue;

    const alreadyHas = await prisma.profileAchievement.findUnique({
      where: { profileId_achievementId: { profileId, achievementId: achievement.id } },
    });
    if (alreadyHas) continue;

    try {
      await prisma.profileAchievement.create({
        data: { profileId, achievementId: achievement.id },
      });
      newlyAwarded.push({ code: achievement.code, title: achievement.title, icon: achievement.icon });
    } catch (err) {
      // P2002: another concurrent request already awarded this achievement first.
      if (err.code !== 'P2002') throw err;
    }
  }

  return newlyAwarded;
}
