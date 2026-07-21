import { motion } from 'framer-motion';
import { XCircle, FileText } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { BookReader } from './ui/BookReader.jsx';
import { DocumentPreview } from './DocumentPreview.jsx';

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Convierte texto plano en párrafos HTML (uno por línea en blanco) para que
// BookReader siempre reciba HTML, sin importar si el artículo viene del
// editor enriquecido o de texto simple.
function toContentHtml(content = '') {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

function hasRealContent(content = '') {
  return content.replace(/<[^>]*>/g, '').trim().length > 0;
}

// Vista de lectura completa de un artículo de periódico/revista. El listado
// (PublicationPage) solo muestra un resumen; aquí se lee el contenido
// completo. Si el admin subió un archivo (PDF/Word) con "la versión
// completa", esa es la lectura principal y se muestra de inmediato (sin un
// clic extra a otro modal) vía DocumentPreview; el texto escrito, si lo hay,
// aparece como introducción arriba. Si no hay archivo adjunto, el texto
// escrito se pagina completo con BookReader. El contenido es opcional: si el
// artículo no tiene ni texto ni adjunto, solo se muestra el encabezado.
export function ArticleReaderModal({ article, onClose }) {
  if (!article) return null;
  const showText = hasRealContent(article.content);
  const hasAttachment = Boolean(article.attachmentUrl);
  const showReader = showText || hasAttachment;
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center ${hasAttachment ? 'p-0 sm:p-4' : 'p-4'}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '4vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '4vh', opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className={`bg-surface shadow-2xl w-full flex flex-col overflow-hidden ${
          hasAttachment
            ? // PdfBookReader ahora ajusta la página al ANCHO (no a la página
              // completa) y permite scroll vertical + zoom, así que un modal
              // más ancho sí se traduce en texto más grande y legible.
              'max-w-4xl sm:max-w-5xl h-full sm:h-[96vh] rounded-none sm:rounded-xl'
            : `max-w-3xl rounded-xl ${showReader ? 'h-[88vh]' : 'max-h-[90vh]'}`
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-start justify-between gap-3 flex-shrink-0 border-b border-edge ${
            hasAttachment ? 'p-2 sm:p-2.5' : 'p-4 sm:p-6 pb-4'
          }`}
        >
          <div className="flex items-start gap-4 min-w-0">
            {article.coverImage && !hasAttachment && (
              <img
                src={resolveFileUrl(article.coverImage)}
                alt={article.title}
                className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-lg shadow-md flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              {!hasAttachment && (
                <div className="flex items-center gap-2 text-sm text-ink-muted flex-wrap">
                  <span className="font-semibold text-accent">{article.author}</span>
                  <span>·</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                  {article.edition && (
                    <>
                      <span>·</span>
                      <span className="bg-surface-alt px-2 py-0.5 rounded-full text-xs">Ed. {article.edition}</span>
                    </>
                  )}
                  <span className="bg-accent-soft text-accent px-2 py-0.5 rounded-full text-xs font-semibold">{article.section}</span>
                </div>
              )}
              <h2
                className={`font-serif font-semibold text-ink truncate ${hasAttachment ? 'text-xs sm:text-sm' : 'text-2xl sm:text-3xl mt-1'}`}
              >
                {article.title}
              </h2>
              {hasAttachment && (
                <span className="text-[11px] text-ink-muted truncate flex items-center gap-1">
                  <FileText className="w-3 h-3 flex-shrink-0" /> {article.attachmentName || 'Archivo adjunto'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {hasAttachment && (
              <a
                href={resolveFileUrl(article.attachmentUrl)}
                download
                className="text-[11px] font-semibold text-accent hover:underline"
              >
                Descargar
              </a>
            )}
            <button onClick={onClose} className="text-ink-muted hover:text-danger transition">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {hasAttachment ? (
          <div className="flex-1 min-h-0 flex flex-col p-1 sm:p-2">
            <DocumentPreview url={article.attachmentUrl} name={article.attachmentName} />
          </div>
        ) : showText ? (
          <div className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col">
            <BookReader html={toContentHtml(article.content)} />
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto">
            <p className="text-ink-muted text-sm">Este artículo no tiene contenido adicional.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
