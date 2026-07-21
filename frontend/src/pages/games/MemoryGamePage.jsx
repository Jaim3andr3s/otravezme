import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, RotateCcw, ArrowLeft, Trophy, BookOpen } from 'lucide-react';
import { useBooks } from '../../context/BooksContext.jsx';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageLoader } from '../../components/ui/Spinner.jsx';
import { IconTile } from '../../components/ui/IconTile.jsx';

const PAIR_COUNT = 6;

function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(books) {
  const chosen = fisherYatesShuffle(books).slice(0, PAIR_COUNT);
  const cards = chosen.flatMap((book) => [
    { key: `${book.id}-a`, bookId: book.id, cover: book.cover, title: book.title },
    { key: `${book.id}-b`, bookId: book.id, cover: book.cover, title: book.title },
  ]);
  return fisherYatesShuffle(cards);
}

export default function MemoryGamePage() {
  const { books, loading } = useBooks();
  const { submitScore, submitting } = useGameScore('memory');

  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const submittedRef = useRef(false);

  const canPlay = books.length >= PAIR_COUNT;

  const startGame = useCallback(() => {
    setDeck(buildDeck(books));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setFinished(false);
    submittedRef.current = false;
  }, [books]);

  useEffect(() => {
    if (canPlay) startGame();
  }, [canPlay, startGame]);

  useEffect(() => {
    if (matched.size !== PAIR_COUNT || submittedRef.current) return;
    submittedRef.current = true;
    setFinished(true);
    const score = Math.max(0, PAIR_COUNT * 10 - moves);
    submitScore({ score, won: true, metadata: { moves, pairs: PAIR_COUNT } });
  }, [matched.size, moves, submitScore]);

  const handleFlip = (card) => {
    if (locked || flipped.some((f) => f.key === card.key) || matched.has(card.bookId)) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped;
      if (a.bookId === b.bookId) {
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(a.bookId));
          setFlipped([]);
          setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  if (loading) return <FullPageLoader label="Barajando las portadas..." />;

  if (!canPlay) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <p className="text-ink-muted">Necesitamos al menos {PAIR_COUNT} libros con portada para jugar el memorama.</p>
        <Link to="/juegos" className="text-accent font-semibold hover:underline">
          Volver a Juegos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconTile icon={Grid3x3} size="sm" className="bg-success-soft text-success" />
          <div>
            <h2 className="text-2xl font-serif font-semibold text-ink">Memorama de Portadas</h2>
            <p className="text-sm text-ink-muted">
              Parejas: {matched.size}/{PAIR_COUNT} · Movimientos: {moves}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {deck.map((card) => {
          const isFlipped = flipped.some((f) => f.key === card.key) || matched.has(card.bookId);
          return (
            <button
              key={card.key}
              onClick={() => handleFlip(card)}
              className="aspect-[3/4] [perspective:800px]"
              disabled={isFlipped}
            >
              <motion.div
                className="relative w-full h-full [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 rounded-lg bg-accent flex items-center justify-center [backface-visibility:hidden] shadow-sm">
                  <BookOpen className="w-6 h-6 text-accent-ink/70" />
                </div>
                <div className="absolute inset-0 rounded-lg overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] border-2 border-edge bg-surface">
                  <img
                    src={card.cover}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/200x280/E2E8F0/1F2937?text=%20';
                    }}
                  />
                  {matched.has(card.bookId) && <div className="absolute inset-0 bg-success/20" />}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-edge rounded-2xl p-8 text-center space-y-4"
          >
            <Trophy className="w-12 h-12 text-gold mx-auto" />
            <h3 className="text-2xl font-serif font-semibold text-ink">¡Memorama completado!</h3>
            <p className="text-ink-muted">Lo lograste en {moves} movimientos.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="success" onClick={startGame} disabled={submitting}>
                <RotateCcw className="w-4 h-4" /> Jugar de nuevo
              </Button>
              <Link to="/juegos" className="px-6 py-3 rounded-xl font-semibold bg-surface-alt text-ink hover:opacity-80 transition inline-flex items-center justify-center">
                Volver a Juegos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
