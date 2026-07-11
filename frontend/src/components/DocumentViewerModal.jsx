import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Loader2, Download, FileWarning } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';

function getExtension(url = '') {
  const clean = url.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Previsualiza el archivo dentro de la app en vez de forzar la descarga:
// - Imágenes: se muestran directamente.
// - PDF: el navegador ya sabe renderizarlo, lo mostramos en un iframe.
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-edge flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto bg-surface-alt/40">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm">Preparando la vista previa...</p>
            </div>
          )}

          {!loading && isImage && (
            <img src={resolvedUrl} alt={name || 'Imagen'} className="max-w-full mx-auto" />
          )}

          {!loading && isPdf && (
            <iframe title={name || 'Documento PDF'} src={resolvedUrl} className="w-full h-[75vh] border-0" />
          )}

          {!loading && isDocx && html && !error && (
            <div
              className="prose prose-sm sm:prose-base max-w-none p-6 bg-surface m-4 rounded-lg shadow-sm text-ink [&_*]:text-ink"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

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
    </div>
  );
}
