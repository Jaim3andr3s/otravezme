import { motion } from 'framer-motion';
import { BookOpenCheck } from 'lucide-react';

export function FullPageLoader({ label = 'Cargando BiblioSueños...' }) {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-bg/90 backdrop-blur-sm z-[100] p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <BookOpenCheck className="w-16 h-16 text-accent" />
      </motion.div>
      <h1 className="mt-4 text-3xl font-serif font-semibold text-ink">{label}</h1>
      <p className="mt-2 text-ink-muted">Conectando con el universo literario.</p>
    </motion.div>
  );
}
