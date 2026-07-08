import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: '-100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100vh', opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
