import { motion } from 'framer-motion';
import { BookOpenCheck } from 'lucide-react';

export function FullPageLoader({ label = 'Cargando BiblioSueños...' }) {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-[100] p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <BookOpenCheck className="w-16 h-16 text-emerald-500" />
      </motion.div>
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{label}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Conectando con el universo literario.</p>
    </motion.div>
  );
}
