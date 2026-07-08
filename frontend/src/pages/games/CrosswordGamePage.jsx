import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Grid } from 'lucide-react';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { IconTile } from '../../components/ui/IconTile.jsx';

// Crucigrama simple (5x5)
const GRID_SIZE = 5;

const CLUES = {
  horizontal: [
    { row: 0, col: 0, word: 'LECTURA', clue: 'Actividad de leer' },
    { row: 2, col: 0, word: 'AUTOR', clue: 'Quien escribe el libro' },
    { row: 4, col: 1, word: 'POESIA', clue: 'Género literario en verso' },
  ],
  vertical: [
    { row: 0, col: 1, word: 'LIBRO', clue: 'Conjunto de hojas encuadernadas' },
    { row: 1, col: 3, word: 'NOVELA', clue: 'Obra narrativa extensa' },
    { row: 3, col: 0, word: 'CUENTO', clue: 'Narración breve' },
  ]
};

function buildGrid() {
  const grid = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill({ letter: '', isBlack: false })
  );
  
  // Colocar palabras horizontales
  CLUES.horizontal.forEach(({ row, col, word }) => {
    for (let i = 0; i < word.length; i++) {
      grid[row][col + i] = { letter: word[i], isBlack: false };
    }
  });
  
  // Colocar palabras verticales
  CLUES.vertical.forEach(({ row, col, word }) => {
    for (let i = 0; i < word.length; i++) {
      grid[row + i][col] = { letter: word[i], isBlack: false };
    }
  });
  
  // Marcar celdas vacías como negras
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].letter === '') {
        grid[r][c] = { letter: '', isBlack: true };
      }
    }
  }
  
  return grid;
}

export default function CrosswordGamePage() {
  const { submitScore, submitting } = useGameScore('crossword');
  const [grid, setGrid] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [status, setStatus] = useState('playing');
  const [moves, setMoves] = useState(0);
  const inputRef = useRef(null);
  
  const startGame = useCallback(() => {
    const newGrid = buildGrid();
    setGrid(newGrid);
    setUserGrid(newGrid.map(row => row.map(cell => ({ ...cell, letter: '' }))));
    setSelectedCell(null);
    setStatus('playing');
    setMoves(0);
  }, []);
  
  useEffect(() => {
    startGame();
  }, [startGame]);
  
  useEffect(() => {
    // Enfocar input cuando se selecciona una celda
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);
  
  const handleCellClick = (row, col) => {
    if (status !== 'playing') return;
    if (grid[row][col].isBlack) return;
    setSelectedCell({ row, col });
  };
  
  const handleKeyDown = (e) => {
    if (!selectedCell || status !== 'playing') return;
    
    const { row, col } = selectedCell;
    const key = e.key.toUpperCase();
    
    if (key >= 'A' && key <= 'Z' && key.length === 1) {
      // Ingresar letra
      const newUserGrid = [...userGrid];
      newUserGrid[row][col] = { ...newUserGrid[row][col], letter: key };
      setUserGrid(newUserGrid);
      setMoves(prev => prev + 1);
      
      // Verificar si está correcta
      const isCorrect = grid[row][col].letter === key;
      if (!isCorrect) {
        // Mostrar feedback (opcional)
      }
      
      // Mover a la siguiente celda (horizontal)
      const nextCol = col + 1;
      if (nextCol < GRID_SIZE && !grid[row][nextCol].isBlack) {
        setSelectedCell({ row, col: nextCol });
      } else {
        // Buscar siguiente celda en la fila
        let found = false;
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!grid[row][c].isBlack) {
            setSelectedCell({ row, col: c });
            found = true;
            break;
          }
        }
        if (!found) {
          // Si no hay más, buscar en filas siguientes
          for (let r = row + 1; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              if (!grid[r][c].isBlack) {
                setSelectedCell({ row: r, col: c });
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
    } else if (e.key === 'Backspace') {
      // Borrar letra
      const newUserGrid = [...userGrid];
      newUserGrid[row][col] = { ...newUserGrid[row][col], letter: '' };
      setUserGrid(newUserGrid);
    } else if (e.key === 'ArrowRight') {
      // Mover a la derecha
      const nextCol = col + 1;
      if (nextCol < GRID_SIZE && !grid[row][nextCol].isBlack) {
        setSelectedCell({ row, col: nextCol });
      }
    } else if (e.key === 'ArrowLeft') {
      const prevCol = col - 1;
      if (prevCol >= 0 && !grid[row][prevCol].isBlack) {
        setSelectedCell({ row, col: prevCol });
      }
    } else if (e.key === 'ArrowDown') {
      const nextRow = row + 1;
      if (nextRow < GRID_SIZE && !grid[nextRow][col].isBlack) {
        setSelectedCell({ row: nextRow, col });
      }
    } else if (e.key === 'ArrowUp') {
      const prevRow = row - 1;
      if (prevRow >= 0 && !grid[prevRow][col].isBlack) {
        setSelectedCell({ row: prevRow, col });
      }
    }
  };
  
  const checkCompletion = useCallback(() => {
    // Verificar si todas las celdas no negras tienen letra correcta
    let allCorrect = true;
    let totalCells = 0;
    let filledCells = 0;
    
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isBlack) continue;
        totalCells++;
        const userLetter = userGrid[r][c]?.letter || '';
        if (userLetter === grid[r][c].letter) {
          filledCells++;
        } else {
          allCorrect = false;
        }
      }
    }
    
    if (allCorrect && filledCells === totalCells && totalCells > 0) {
      setStatus('won');
      submitScore({ score: totalCells * 5, won: true, metadata: { moves } });
    }
  }, [grid, userGrid, moves, submitScore]);
  
  useEffect(() => {
    if (status === 'playing') {
      checkCompletion();
    }
  }, [userGrid, checkCompletion, status]);
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>
      
      <div className="flex items-center gap-3">
        <IconTile icon={Grid} size="sm" className="bg-gold-soft text-gold" />
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink">Crucigrama Literario</h2>
          <p className="text-sm text-ink-muted">
            Escribe las letras en las casillas. Usa las flechas para moverte.
          </p>
        </div>
      </div>
      
      {/* Clues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-alt rounded-lg p-4 border border-edge">
          <h4 className="font-semibold text-ink mb-2">Horizontales</h4>
          <ul className="space-y-1 text-sm text-ink-muted">
            {CLUES.horizontal.map((clue, idx) => (
              <li key={`h-${idx}`}>
                <span className="font-medium text-accent">{idx + 1}.</span> {clue.clue}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-alt rounded-lg p-4 border border-edge">
          <h4 className="font-semibold text-ink mb-2">Verticales</h4>
          <ul className="space-y-1 text-sm text-ink-muted">
            {CLUES.vertical.map((clue, idx) => (
              <li key={`v-${idx}`}>
                <span className="font-medium text-accent">{idx + 1}.</span> {clue.clue}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-surface border border-edge rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
          {grid.map((row, r) => (
            row.map((cell, c) => {
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;
              const userLetter = userGrid[r]?.[c]?.letter || '';
              const isCorrect = userLetter === cell.letter && userLetter !== '';
              
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square flex items-center justify-center text-xl font-bold rounded-md transition-colors relative ${
                    cell.isBlack
                      ? 'bg-gray-800 dark:bg-gray-900'
                      : isSelected
                      ? 'bg-accent text-accent-ink'
                      : isCorrect
                      ? 'bg-success-soft text-success'
                      : userLetter
                      ? 'bg-danger-soft text-danger'
                      : 'bg-surface-alt hover:bg-accent-soft hover:text-accent cursor-pointer'
                  }`}
                >
                  {!cell.isBlack && (
                    <>
                      {userLetter || ''}
                      {isSelected && (
                        <div className="absolute inset-0 ring-2 ring-accent rounded-md" />
                      )}
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute w-0 h-0"
        onKeyDown={handleKeyDown}
        autoFocus
      />
      
      <div className="flex gap-3 justify-center">
        <Button variant="danger" onClick={startGame} disabled={submitting}>
          <RotateCcw className="w-4 h-4" /> Nueva partida
        </Button>
      </div>
      
      <AnimatePresence>
        {status === 'won' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-edge rounded-2xl p-8 text-center space-y-4"
          >
            <Trophy className="w-12 h-12 text-gold mx-auto" />
            <h3 className="text-2xl font-serif font-semibold text-ink">¡Crucigrama completado!</h3>
            <p className="text-ink-muted">Has resuelto todas las palabras.</p>
            <Link to="/juegos" className="inline-block px-6 py-3 rounded-xl font-semibold bg-surface-alt text-ink hover:opacity-80 transition">
              Volver a Juegos
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}