import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Frown, Search } from 'lucide-react';
import { useGameScore } from '../../hooks/useGameScore.js';
import { Button } from '../../components/ui/Button.jsx';
import { IconTile } from '../../components/ui/IconTile.jsx';

// Generador de sopa de letras simple (10x10)
const GRID_SIZE = 10;
const WORDS = [
  'LIBRO', 'LECTURA', 'AUTOR', 'POESIA', 'NOVELA',
  'CUENTO', 'FANTASIA', 'AVENTURA', 'MISTERIO', 'CIENCIA'
];

function generateGrid() {
  // Inicializar grid vacío
  const grid = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill('')
  );
  
  // Colocar palabras horizontal y verticalmente
  const placedWords = [];
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
  ];
  
  WORDS.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const [dr, dc] = dir;
      
      // Verificar si cabe
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= GRID_SIZE || c >= GRID_SIZE || r < 0 || c < 0) {
          fits = false;
          break;
        }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          fits = false;
          break;
        }
      }
      
      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          grid[r][c] = word[i];
        }
        placedWords.push(word);
        placed = true;
      }
    }
  });
  
  // Rellenar espacios vacíos con letras aleatorias
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  
  return { grid, placedWords };
}

export default function WordsearchGamePage() {
  const { submitScore, submitting } = useGameScore('wordsearch');
  const [grid, setGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [status, setStatus] = useState('playing');
  const [moves, setMoves] = useState(0);
  
  const startGame = useCallback(() => {
    const { grid: newGrid, placedWords: newWords } = generateGrid();
    setGrid(newGrid);
    setPlacedWords(newWords);
    setFoundWords([]);
    setSelectedCells([]);
    setStatus('playing');
    setMoves(0);
  }, []);
  
  useEffect(() => {
    startGame();
  }, [startGame]);
  
  const handleCellClick = (row, col) => {
    if (status !== 'playing') return;
    
    // Si ya hay selección, verificar si forma palabra
    if (selectedCells.length > 0) {
      const last = selectedCells[selectedCells.length - 1];
      const dr = Math.abs(row - last.row);
      const dc = Math.abs(col - last.col);
      
      // Solo permitir movimientos adyacentes (horizontal, vertical o diagonal)
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1) || (dr === 1 && dc === 1)) {
        // Evitar repetir celdas
        if (!selectedCells.some(c => c.row === row && c.col === col)) {
          setSelectedCells([...selectedCells, { row, col }]);
        }
        return;
      }
      
      // Si no es adyacente, empezar nueva selección
      setSelectedCells([{ row, col }]);
      return;
    }
    
    // Primera selección
    setSelectedCells([{ row, col }]);
  };
  
  const handleSubmitWord = () => {
    if (selectedCells.length < 3 || status !== 'playing') return;
    
    const word = selectedCells.map(c => grid[c.row][c.col]).join('');
    const wordReversed = word.split('').reverse().join('');
    
    // Verificar si la palabra está en la lista y no ha sido encontrada
    let foundWord = null;
    if (placedWords.includes(word) && !foundWords.includes(word)) {
      foundWord = word;
    } else if (placedWords.includes(wordReversed) && !foundWords.includes(wordReversed)) {
      foundWord = wordReversed;
    }
    
    if (foundWord) {
      const newFoundWords = [...foundWords, foundWord];
      setFoundWords(newFoundWords);
      setMoves(prev => prev + 1);
      
      // Verificar si se encontraron todas
      if (newFoundWords.length === placedWords.length) {
        setStatus('won');
        submitScore({ score: placedWords.length * 10, won: true, metadata: { moves } });
      }
    } else {
      setMoves(prev => prev + 1);
    }
    
    setSelectedCells([]);
  };
  
  const handleClearSelection = () => {
    setSelectedCells([]);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/juegos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Volver a Juegos
      </Link>
      
      <div className="flex items-center gap-3">
        <IconTile icon={Search} size="sm" className="bg-accent-soft text-accent" />
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink">Sopa de Letras</h2>
          <p className="text-sm text-ink-muted">
            Encuentra las palabras ocultas. Selecciona letras adyacentes y presiona "Enviar".
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {placedWords.map((word, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              foundWords.includes(word)
                ? 'bg-success-soft text-success'
                : 'bg-surface-alt text-ink-muted'
            }`}
          >
            {word} {foundWords.includes(word) && '✅'}
          </span>
        ))}
      </div>
      
      <div className="bg-surface border border-edge rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
          {grid.map((row, r) => (
            row.map((letter, c) => {
              const isSelected = selectedCells.some(cell => cell.row === r && cell.col === c);
              const isFound = foundWords.some(word => {
                // Verificar si la celda pertenece a alguna palabra encontrada (simplificado)
                return false; // Simplificación: no marcamos celdas de palabras encontradas
              });
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square flex items-center justify-center text-lg font-bold rounded-md transition-colors ${
                    isSelected
                      ? 'bg-accent text-accent-ink'
                      : 'bg-surface-alt hover:bg-accent-soft hover:text-accent'
                  }`}
                >
                  {letter}
                </button>
              );
            })
          ))}
        </div>
      </div>
      
      <div className="flex gap-3 justify-center">
        {selectedCells.length > 0 && (
          <>
            <Button variant="primary" onClick={handleSubmitWord} disabled={submitting}>
              Enviar palabra ({selectedCells.map(c => grid[c.row][c.col]).join('')})
            </Button>
            <Button variant="secondary" onClick={handleClearSelection}>
              Limpiar selección
            </Button>
          </>
        )}
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
            <h3 className="text-2xl font-serif font-semibold text-ink">¡Sopa completada!</h3>
            <p className="text-ink-muted">Encontraste todas las palabras.</p>
            <Link to="/juegos" className="inline-block px-6 py-3 rounded-xl font-semibold bg-surface-alt text-ink hover:opacity-80 transition">
              Volver a Juegos
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}