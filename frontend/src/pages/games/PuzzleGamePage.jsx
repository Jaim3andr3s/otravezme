import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import { useBooks } from '../../context/BooksContext.jsx';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { FullPageLoader } from '../../components/ui/Spinner.jsx';
import { IconTile } from '../../components/ui/IconTile.jsx';

const GRID = 3;
const EMPTY = GRID * GRID - 1;
const SHUFFLE_MOVES = 120;

function solvedBoard() {
  return Array.from({ length: GRID * GRID }, (_, i) => i);
}

function adjacent(a, b) {
  const rowA = Math.floor(a / GRID);
  const colA = a % GRID;
  const rowB = Math.floor(b / GRID);
  const colB = b % GRID;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

function shuffleBoard() {
  let board = solvedBoard();
  let emptyPos = EMPTY;
  for (let i = 0; i < SHUFFLE_MOVES; i += 1) {
    const options = board.map((_, pos) => pos).filter((pos) => adjacent(pos, emptyPos));
    const move = options[Math.floor(Math.random() * options.length)];
    [board[move], board[emptyPos]] = [board[emptyPos], board[move]];
    emptyPos = move;
  }
  return board;
}

function pickCover(books) {
  const withCover = books.filter((b) => b.cover);
  return withCover[Math.floor(Math.random() * withCover.length)];
}

export default function PuzzleGamePage() {
  const { books, loading } = useBooks();
  const { submitScore, submitting } = useGameScore('puzzle');

  const [book, setBook] = useState(null);
  const [board, setBoard] = useState(solvedBoard());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const startGame = useCallback(() => {
    if (books.length === 0) return;
    setBook(pickCover(books));
    setBoard(shuffleBoard());
    setMoves(0);
    setWon(false);
  }, [books]);

  useEffect(() => {
    if (books.length > 0 && !book) startGame();
  }, [books, book, startGame]);

  const submitResult = useCallback(
    async (finalMoves) => {
      const score = Math.max(0, 200 - finalMoves);
      await submitScore({ score, won: true, metadata: { moves: finalMoves } });
    },
    [submitScore]
  );

  const handleTileClick = (pos) => {
    if (won) return;
    const emptyPos = board.indexOf(EMPTY);
    if (!adjacent(pos, emptyPos)) return;

    const nextBoard = [...board];
    [nextBoard[pos], nextBoard[emptyPos]] = [nextBoard[emptyPos], nextBoard[pos]];
    setBoard(nextBoard);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (nextBoard.every((tile, i) => tile === i)) {
      setWon(true);
      submitResult(nextMoves);
    }
  };

  if (loading || !book) return <FullPageLoader label="Recortando una portada..." />;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>

      <div className="flex items-center gap-3">
        <IconTile icon={Puzzle} size="sm" className="bg-gold-soft text-gold" />
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink">Rompecabezas de Portada</h2>
          <p className="text-sm text-ink-muted">Movimientos: {moves}</p>
        </div>
      </div>

      <div className="relative aspect-square rounded-2xl overflow-hidden border border-edge shadow-sm bg-surface-alt">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-1">
          {board.map((tile, pos) => (
            <button
              key={pos}
              onClick={() => handleTileClick(pos)}
              disabled={tile === EMPTY || won}
              className={`relative rounded-md overflow-hidden ${tile === EMPTY ? 'bg-surface-alt' : 'shadow-sm'}`}
            >
              {tile !== EMPTY && (
                <motion.div
                  layout
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: `url(${book.cover})`,
                    backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
                    backgroundPosition: `${(tile % GRID) * (100 / (GRID - 1))}% ${Math.floor(tile / GRID) * (100 / (GRID - 1))}%`,
                  }}
                  transition={{ duration: 0.18 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-edge rounded-2xl p-8 text-center space-y-4"
          >
            <Trophy className="w-12 h-12 text-gold mx-auto" />
            <h3 className="text-2xl font-serif font-semibold text-ink">¡Portada reconstruida!</h3>
            <p className="text-ink-muted">
              &ldquo;{book.title}&rdquo; en {moves} movimientos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="pink" onClick={startGame} disabled={submitting}>
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
