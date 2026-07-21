import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { XCircle, Download } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { DocumentPreview } from './DocumentPreview.jsx';

export function DocumentViewerModal({ url, name, onClose }) {
  const resolvedUrl = resolveFileUrl(url);

  // Portal a document.body: este visor suele abrirse desde dentro de otro
  // modal (ej. ArticleReaderModal), que usa framer-motion y por lo tanto
  // tiene un `transform` propio. Un `transform` en un ancestro convierte a
  // ese ancestro en el "contenedor" de cualquier `position: fixed` interno
  // (así lo define CSS), así que sin el portal este visor quedaba encerrado
  // dentro del tamaño del modal padre en vez de cubrir toda la pantalla.
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-surface shadow-2xl w-full max-w-6xl h-full sm:h-[95vh] rounded-none sm:rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-2 sm:p-2.5 border-b border-edge flex-shrink-0">
          <h2 className="text-xs sm:text-sm font-semibold text-ink truncate pr-4">{name || 'Documento'}</h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={resolvedUrl}
              download
              className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Descargar
            </a>
            <button onClick={onClose} className="text-ink-muted hover:text-danger transition">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-1 sm:p-2">
          <DocumentPreview url={url} name={name} />
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
