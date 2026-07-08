import { motion } from 'framer-motion';
import { Brain, Grid3x3, Type, Puzzle, Search, Grid, Trophy } from 'lucide-react';
import { GameCard } from '../components/games/GameCard.jsx';
import { BadgeTile } from '../components/achievements/BadgeTile.jsx';
import { useAchievements } from '../context/AchievementsContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';

const GAMES = [
  {
    to: '/juegos/trivia',
    icon: Brain,
    title: 'Trivia de Libros',
    description: 'Responde preguntas sobre los libros del catálogo: autores, categorías y más.',
    accentClass: 'bg-accent-soft text-accent',
  },
  {
    to: '/juegos/memorama',
    icon: Grid3x3,
    title: 'Memorama de Portadas',
    description: 'Encuentra las parejas de portadas antes de quedarte sin movimientos de más.',
    accentClass: 'bg-success-soft text-success',
  },
  {
    to: '/juegos/ahorcado',
    icon: Type,
    title: 'Ahorcado Literario',
    description: 'Adivina el título o autor secreto letra por letra antes de agotar tus intentos.',
    accentClass: 'bg-danger-soft text-danger',
  },
  {
    to: '/juegos/rompecabezas',
    icon: Puzzle,
    title: 'Rompecabezas de Portada',
    description: 'Ordena las piezas deslizantes para reconstruir la portada de un libro.',
    accentClass: 'bg-gold-soft text-gold',
  },
  // NUEVOS JUEGOS (Fase C)
  {
    to: '/juegos/sopa-de-letras',
    icon: Search,
    title: 'Sopa de Letras',
    description: 'Encuentra las palabras ocultas en la cuadrícula de letras.',
    accentClass: 'bg-accent-soft text-accent',
  },
  {
    to: '/juegos/crucigrama',
    icon: Grid,
    title: 'Crucigrama Literario',
    description: 'Completa el crucigrama con las palabras que coinciden con las definiciones.',
    accentClass: 'bg-purple-soft text-purple',
  },
];

export default function GamesHubPage() {
  const { catalog } = useAchievements();
  const { profile } = useProfile();
  const earnedCodes = new Set((profile?.achievements ?? []).map((a) => a.code));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-4xl font-serif font-semibold text-ink">🎮 Juegos de BiblioSueños</h2>
        <p className="text-lg text-ink-muted">Diviértete con el catálogo y gana insignias por cada logro.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAMES.map((game) => (
          <GameCard key={game.to} {...game} />
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-serif font-semibold text-ink flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold" /> Mis Insignias ({earnedCodes.size}/{catalog.length})
        </h3>
        {catalog.length === 0 ? (
          <p className="text-ink-muted">Cargando insignias...</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {catalog.map((achievement) => (
              <BadgeTile key={achievement.code} achievement={achievement} earned={earnedCodes.has(achievement.code)} />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}