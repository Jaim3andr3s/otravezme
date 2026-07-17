import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { XCircle, Loader2, Download, FileWarning } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { BookReader } from './ui/BookReader.jsx';
import { PdfBookReader } from './ui/PdfBookReader.jsx';

function getExtension(url = '') {
  const clean = url.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Previsualiza el archivo dentro de la app en vez de forzar la descarga:
// - Imágenes: se muestran directamente.
// - PDF: se renderiza página por página con pdf.js dentro del marco de
//   libro (PdfBookReader), en vez de incrustar el visor nativo del
//   navegador con su propia barra de herramientas.
// - Word moderno (.docx): se convierte a texto con formato usando "mammoth",
//   en el propio navegador (nada se sube a ningún servidor externo).
// - Word antiguo (.doc) u otros formatos: no se pueden previsualizar en el
//   navegador, así que ofrecemos el enlace de descarga como alternativa.
export function DocumentViewerModal({ url, name, onClose }) {
  const resolvedUrl = resolveFileUrl(url);
  const ext = getExtension(url);
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(ext === 'docx');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ext !== 'docx') return;
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const mammothModule = await import('mammoth');
        const mammoth = mammothModule.convertToHtml ? mammothModule : mammothModule.default;
        const response = await fetch(resolvedUrl);
        if (!response.ok) throw new Error('No se pudo descargar el archivo para previsualizarlo.');
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) setHtml(result.value);
      } catch (err) {
        if (!cancelled) setError('No se pudo previsualizar este documento. Puedes descargarlo abajo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedUrl, ext]);

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  const isPdf = ext === 'pdf';
  const isDocx = ext === 'docx';
  const canPreview = isImage || isPdf || (isDocx && html && !error);

  // Portal a document.body: este visor suele abrirse desde dentro de otro
  // modal (ej. ArticleReaderModal), que usa framer-motion y por lo tanto
  // tiene un `transform` propio. Un `transform` en un ancestro convierte a
  // ese ancestro en el "contenedor" de cualquier `position: fixed` interno
  // (así lo define CSS), así que sin el portal este visor quedaba encerrado
  // dentro del tamaño del modal padre en vez de cubrir toda la pantalla.
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-edge flex-shrink-0">
          <h2 className="text-lg font-semibold text-ink truncate pr-4">{name || 'Documento'}</h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={resolvedUrl}
              download
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Descargar
            </a>
            <button onClick={onClose} className="text-ink-muted hover:text-danger transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className={`bg-surface-alt/40 ${isPdf || (isDocx && html && !error) ? 'flex-1 min-h-0 flex flex-col p-2 sm:p-4' : 'flex-1 overflow-y-auto'}`}>
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm">Preparando la vista previa...</p>
            </div>
          )}

          {!loading && isImage && (
            <img src={resolvedUrl} alt={name || 'Imagen'} className="max-w-full mx-auto" />
          )}

          {!loading && isPdf && <PdfBookReader url={resolvedUrl} />}

          {!loading && isDocx && html && !error && <BookReader html={html} />}

          {!loading && (error || (!canPreview && !isImage && !isPdf)) && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <FileWarning className="w-12 h-12 text-ink-muted" />
              <p className="text-ink-muted text-sm max-w-xs">
                {error || 'Este tipo de archivo no se puede previsualizar aquí. Descárgalo para verlo.'}
              </p>
              <a
                href={resolvedUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg text-sm"
              >
                <Download className="w-4 h-4" /> Descargar archivo
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
