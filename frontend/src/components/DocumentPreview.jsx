import { useState, useEffect } from 'react';
import { Loader2, Download, FileWarning } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { BookReader } from './ui/BookReader.jsx';
import { PdfBookReader } from './ui/PdfBookReader.jsx';

function getExtension(url = '') {
  const clean = url.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Previsualiza un archivo dentro de la app en vez de forzar la descarga:
// - Imágenes: se muestran directamente.
// - PDF: se renderiza página por página con pdf.js (PdfBookReader).
// - Word moderno (.docx): se convierte a HTML con "mammoth" en el propio
//   navegador (nada se sube a ningún servidor externo) y se pagina con
//   BookReader.
// - Word antiguo (.doc) u otros formatos: no se pueden previsualizar, así
//   que se ofrece el enlace de descarga como alternativa.
// Requiere un contenedor padre `flex flex-col` con altura definida — cada
// rama ya se marca a sí misma como `flex-1 min-h-0` para ocupar el espacio
// disponible.
export function DocumentPreview({ url, name }) {
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
      } catch {
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

  if (loading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-2 py-20 text-ink-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm">Preparando la vista previa...</p>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <img src={resolvedUrl} alt={name || 'Imagen'} className="max-w-full mx-auto" />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <PdfBookReader url={resolvedUrl} />
      </div>
    );
  }

  if (isDocx && html && !error) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <BookReader html={html} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
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
  );
}
