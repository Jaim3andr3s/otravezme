import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import { useBooks } from '../../context/BooksContext.jsx';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageLoader } from '../../components/ui/Spinner.jsx';

const QUESTION_COUNT = 8;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildQuestions(books) {
  const pool = shuffle(books).slice(0, QUESTION_COUNT);
  return pool.map((book) => {
    const askAuthor = Math.random() > 0.5;
    const field = askAuthor ? 'author' : 'category';
    const prompt = askAuthor ? `¿Quién escribió "${book.title}"?` : `¿A qué categoría pertenece "${book.title}"?`;
    const distractors = shuffle(
      books.filter((b) => b.id !== book.id && b[field] !== book[field]).map((b) => b[field])
    );
    const uniqueDistractors = [...new Set(distractors)].slice(0, 3);
    const options = shuffle([book[field], ...uniqueDistractors]);
    return { book, prompt, correct: book[field], options };
  });
}

export default function TriviaGamePage() {
  const { books, loading } = useBooks();
  const { submitScore, submitting } = useGameScore('trivia');
  const questions = useMemo(() => (books.length >= 5 ? buildQuestions(books) : []), [books]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const finish = useCallback(
    async (finalScore) => {
      setFinished(true);
      const perfect = finalScore === questions.length;
      await submitScore({
        score: finalScore,
        won: finalScore >= Math.ceil(questions.length / 2),
        metadata: { total: questions.length, perfect },
      });
    },
    [questions.length, submitScore]
  );

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === current.correct;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(nextScore);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelected(null);
      } else {
        finish(nextScore);
      }
    }, 900);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  if (loading) return <FullPageLoader label="Preparando la trivia..." />;

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <p className="text-ink-muted">Necesitamos más libros en el catálogo para generar una trivia.</p>
        <Link to="/juegos" className="text-accent font-semibold hover:underline">
          Volver a Juegos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink">Trivia de Libros</h2>
          <p className="text-sm text-ink-muted">Pregunta {Math.min(index + 1, questions.length)} de {questions.length}</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < index || finished ? 'bg-accent' : i === index ? 'bg-accent/50' : 'bg-edge'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-edge rounded-2xl p-6 shadow-sm space-y-5"
          >
            <p className="text-xl font-serif font-medium text-ink">{current.prompt}</p>
            <div className="grid grid-cols-1 gap-3">
              {current.options.map((option) => {
                const isCorrect = option === current.correct;
                const isSelected = option === selected;
                const showState = selected !== null;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showState}
                    className={`flex items-center justify-between text-left px-4 py-3 rounded-xl border font-medium transition-colors ${
                      showState && isCorrect
                        ? 'bg-success-soft border-success text-success'
                        : showState && isSelected
                        ? 'bg-danger-soft border-danger text-danger'
                        : 'bg-surface-alt border-edge text-ink hover:border-accent'
                    }`}
                  >
                    {option}
                    {showState && isCorrect && <Check className="w-5 h-5" />}
                    {showState && isSelected && !isCorrect && <X className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-edge rounded-2xl p-8 text-center space-y-4"
          >
            <Trophy className="w-12 h-12 text-gold mx-auto" />
            <h3 className="text-2xl font-serif font-semibold text-ink">
              {score === questions.length ? '¡Puntaje perfecto!' : '¡Trivia completada!'}
            </h3>
            <p className="text-ink-muted">
              Acertaste {score} de {questions.length} preguntas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="primary" onClick={restart} disabled={submitting}>
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
