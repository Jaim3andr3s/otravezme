import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FullPageLoader } from './Spinner.jsx';

export function AsyncData({ loading, error, onRetry, children, loaderLabel = 'Cargando...', fullPage = false }) {
  if (loading) {
    if (fullPage) return <FullPageLoader label={loaderLabel} />;
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-ink-muted">{loaderLabel}</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-4 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-danger" />
        <p className="text-danger font-semibold text-lg">Error al cargar</p>
        <p className="text-ink-muted max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl font-semibold bg-surface-alt text-ink hover:bg-edge transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Intentar de nuevo
          </button>
        )}
      </motion.div>
    );
  }

  return children;
}
