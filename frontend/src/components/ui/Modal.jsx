import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export function Modal({ children, title, onClose }) {
  const overlayRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <motion.div
        initial={{ y: '-100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100vh', opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-edge sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-semibold font-serif text-accent">{title}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-ink-muted hover:text-danger transition"
            aria-label="Cerrar"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
