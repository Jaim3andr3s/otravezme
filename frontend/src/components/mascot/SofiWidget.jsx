import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useMascot, IDLE_CHATTER, pick } from '../../context/MascotContext.jsx';
import  SofiMascot  from './SofiMascot.jsx';

// Ícono de zorro simple en SVG (fallback si el modelo 3D falla)
function SofiIcon({ size = 80 }) {
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

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <SofiIcon size={80} />;
    }
    return this.props.children;
  }
}

// Animación del contenedor según el mood, para que también se note cuando
// el modelo 3D no está disponible y se usa el ícono SVG de respaldo.
const BUTTON_MOOD_ANIMATION = {
  neutral: {},
  curiosa: { rotate: [0, -3, 3, 0] },
  animando: { y: [0, -8, 0] },
  celebrando: { y: [0, -14, 0], rotate: [0, -6, 6, 0] },
};

export function SofiWidget() {
  const { message, mood, action, visible, dismiss, showMessage } = useMascot();
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [modelExists, setModelExists] = useState(null);
  const navigate = useNavigate();

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
    // Si ya hay un mensaje activo, el tap solo abre/cierra el globo.
    if (message) {
      setBubbleOpen((open) => !open);
      return;
    }
    // Sin mensaje activo: Sofi siempre tiene algo que decir. Tocarla la hace
    // hablar con una frase suelta en vez de quedarse en silencio.
    showMessage(pick(IDLE_CHATTER), 'curiosa', 4500);
  };

  const handleAction = () => {
    if (!action) return;
    navigate(action.to);
    dismiss();
  };

  const buttonAnimation = prefersReducedMotion ? {} : (BUTTON_MOOD_ANIMATION[mood] || {});

  return (
    <div className="fixed bottom-0 right-0 sm:right-2 z-[100] flex flex-col items-end gap-2 pointer-events-none pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      <AnimatePresence>
        {bubbleOpen && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="max-w-[75vw] sm:max-w-xs bg-surface border border-edge rounded-xl shadow-lg p-3 sm:p-4 text-ink relative mr-3 sm:mr-4 pointer-events-auto"
          >
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute top-2 right-2 text-ink-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs sm:text-sm font-serif italic leading-relaxed pr-6">{message}</p>
            {action && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleAction}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-alt text-ink border border-edge hover:opacity-80 transition"
                >
                  {action.label}
                </button>
              </div>
            )}
            <div className="absolute -bottom-2 right-10 w-4 h-4 bg-surface border-r border-b border-edge transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofi de cuerpo completo, libre, sin fondo ni borde circular. Una
          sombra elíptica en el piso la ancla visualmente en vez de un halo.
          Tamaño escalado por breakpoint para que no tape contenido en móvil. */}
      <motion.button
        onClick={handleToggle}
        className="relative w-[92px] h-[155px] sm:w-40 sm:h-[300px] flex items-end justify-center bg-transparent focus:outline-none pointer-events-auto touch-manipulation"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        animate={buttonAnimation}
        transition={{ duration: 1.6, repeat: message ? Infinity : 0, repeatDelay: 0.6 }}
        aria-label="Hablar con Sofi"
      >
        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-2 w-11 sm:w-20 h-2.5 sm:h-4 rounded-full bg-ink/20 blur-sm"
            animate={{ scaleX: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {modelExists === null ? (
          <div className="w-24 h-44 sm:w-32 sm:h-64 rounded-3xl bg-surface-alt animate-pulse" />
        ) : modelExists ? (
          <ErrorBoundary>
            <SofiMascot
              reducedMotion={prefersReducedMotion}
              mood={mood}
              talking={bubbleOpen && Boolean(message)}
            />
          </ErrorBoundary>
        ) : (
          <SofiIcon size={64} />
        )}
      </motion.button>
    </div>
  );
}
