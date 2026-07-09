import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMascot } from '../../context/MascotContext.jsx';
import  SofiMascot  from './SofiMascot.jsx';

// Ícono de zorro simple en SVG (fallback si el modelo 3D falla)
function SofiIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#f5a623" stroke="#ffffff" strokeWidth="3" />
      <path d="M35 45 L25 35 L35 38 L35 45Z" fill="#1f2937" />
      <path d="M65 45 L75 35 L65 38 L65 45Z" fill="#1f2937" />
      <ellipse cx="40" cy="48" rx="4" ry="5" fill="white" />
      <ellipse cx="60" cy="48" rx="4" ry="5" fill="white" />
      <ellipse cx="42" cy="46" rx="2" ry="2" fill="#1f2937" />
      <ellipse cx="62" cy="46" rx="2" ry="2" fill="#1f2937" />
      <ellipse cx="50" cy="60" rx="8" ry="5" fill="#1f2937" />
      <path d="M50 55 C50 55 44 52 40 56 C44 58 48 57 50 55Z" fill="#1f2937" />
      <path d="M50 55 C50 55 56 52 60 56 C56 58 52 57 50 55Z" fill="#1f2937" />
    </svg>
  );
}

// ErrorBoundary para capturar errores de carga del modelo 3D
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <SofiIcon size={56} />;
    }
    return this.props.children;
  }
}

export function SofiWidget() {
  const { message, visible } = useMascot();
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [modelExists, setModelExists] = useState(null);

  // Verificar si el modelo 3D existe antes de montarlo
  useEffect(() => {
    const checkModel = async () => {
      try {
        const response = await fetch('/models/sofi.glb', { method: 'HEAD' });
        setModelExists(response.ok);
      } catch {
        setModelExists(false);
      }
    };
    checkModel();
  }, []);

  // Cuando llega un mensaje nuevo (saludo, logro, etc.) el globo se abre solo;
  // si el mensaje se limpia (timeout o dismiss), el globo se cierra con él.
  useEffect(() => {
    setBubbleOpen(Boolean(message));
  }, [message]);

  if (!visible) return null;

  const handleToggle = () => {
    // Sin mensaje activo no hay nada que mostrar en el globo: el tap solo da
    // feedback táctil (whileTap ya lo cubre), no abre un globo vacío.
    if (!message) return;
    setBubbleOpen((open) => !open);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      <AnimatePresence>
        {bubbleOpen && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="max-w-xs bg-surface border border-edge rounded-xl shadow-lg p-4 text-ink relative"
          >
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute top-2 right-2 text-ink-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm font-serif italic leading-relaxed pr-6">{message}</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-surface border-r border-b border-edge transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleToggle}
        className="w-16 h-16 rounded-full bg-surface border-2 border-accent shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        whileTap={{ scale: 0.9 }}
        aria-label="Abrir mensaje de Sofi"
      >
        {modelExists === null ? (
          <div className="w-14 h-14 rounded-full bg-surface-alt animate-pulse" />
        ) : modelExists ? (
          <ErrorBoundary>
            <SofiMascot size={56} reducedMotion={prefersReducedMotion} />
          </ErrorBoundary>
        ) : (
          <SofiIcon size={56} />
        )}
      </motion.button>
    </div>
  );
}