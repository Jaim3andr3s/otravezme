import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, RotateCcw, ArrowLeft, Trophy, Frown, BookOpen } from 'lucide-react';
import { useBooks } from '../../context/BooksContext.jsx';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageLoader } from '../../components/ui/Spinner.jsx';
import { IconTile } from '../../components/ui/IconTile.jsx';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
}

function pickSecret(books) {
  const book = books[Math.floor(Math.random() * books.length)];
  const useTitle = Math.random() > 0.3;
  return { text: normalize(useTitle ? book.title : book.author), original: useTitle ? book.title : book.author, book };
}

export default function HangmanGamePage() {
  const { books, loading } = useBooks();
  const { submitScore, submitting } = useGameScore('hangman');

  const [round, setRound] = useState(null);
  const [guessed, setGuessed] = useState(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [status, setStatus] = useState('playing');

  const startGame = useCallback(() => {
    if (books.length === 0) return;
    setRound(pickSecret(books));
    setGuessed(new Set());
    setWrongCount(0);
    setStatus('playing');
  }, [books]);

  useEffect(() => {
    if (books.length > 0 && !round) startGame();
  }, [books, round, startGame]);

  const secretLetters = useMemo(() => (round ? [...new Set(round.text.replace(/[^A-Z]/g, ''))] : []), [round]);

  const submitResult = useCallback(
    async (won, finalWrong) => {
      const score = won ? (MAX_WRONG - finalWrong) * 10 : 0;
      await submitScore({ score, won, metadata: { wrongCount: finalWrong, wordLength: secretLetters.length } });
    },
    [submitScore, secretLetters.length]
  );

  const handleGuess = (letter) => {
    if (status !== 'playing' || guessed.has(letter)) return;
    const nextGuessed = new Set(guessed);
    nextGuessed.add(letter);
    setGuessed(nextGuessed);

    if (secretLetters.includes(letter)) {
      const allFound = secretLetters.every((l) => nextGuessed.has(l));
      if (allFound) {
        setStatus('won');
        submitResult(true, wrongCount);
      }
    } else {
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      if (nextWrong >= MAX_WRONG) {
        setStatus('lost');
        submitResult(false, nextWrong);
      }
    }
  };

  if (loading || !round) return <FullPageLoader label="Eligiendo una palabra secreta..." />;

  const remaining = MAX_WRONG - wrongCount;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>

      <div className="flex items-center gap-3">
        <IconTile icon={Type} size="sm" className="bg-danger-soft text-danger" />
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink">Ahorcado Literario</h2>
          <p className="text-sm text-ink-muted">Adivina el título o autor secreto.</p>
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {Array.from({ length: MAX_WRONG }).map((_, i) => (
          <BookOpen key={i} className={`w-6 h-6 ${i < remaining ? 'text-accent' : 'text-edge'}`} />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 py-2">
        {round.text.split('').map((char, i) => {
          const isLetter = /[A-Z]/.test(char);
          if (!isLetter) {
            return (
              <span key={i} className="w-3 h-9 flex items-end justify-center text-xl font-serif font-semibold text-ink">
                {char === ' ' ? '' : char}
              </span>
            );
          }
          return (
            <span
              key={i}
              className="w-7 h-9 flex items-end justify-center text-xl font-serif font-semibold text-ink border-b-2 border-edge"
            >
              {guessed.has(char) || status !== 'playing' ? char : ''}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
        {ALPHABET.map((letter) => {
          const isGuessed = guessed.has(letter);
          const isCorrect = isGuessed && secretLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed || status !== 'playing'}
              className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                isGuessed
                  ? isCorrect
                    ? 'bg-success-soft text-success'
                    : 'bg-danger-soft text-danger'
                  : 'bg-surface-alt text-ink hover:bg-accent-soft hover:text-accent'
              } disabled:cursor-not-allowed`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {status !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-edge rounded-2xl p-8 text-center space-y-4"
          >
            {status === 'won' ? (
              <Trophy className="w-12 h-12 text-gold mx-auto" />
            ) : (
              <Frown className="w-12 h-12 text-danger mx-auto" />
            )}
            <h3 className="text-2xl font-serif font-semibold text-ink">
              {status === 'won' ? '¡Lo adivinaste!' : 'Esta vez no se pudo'}
            </h3>
            <p className="text-ink-muted">
              {status === 'lost' && (
                <>
                  La respuesta era <strong className="text-ink">{round.original}</strong>.
                </>
              )}
              {status === 'won' && `Era "${round.original}".`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="danger" onClick={startGame} disabled={submitting}>
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
