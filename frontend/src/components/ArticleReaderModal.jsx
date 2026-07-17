import { motion } from 'framer-motion';
import { XCircle, FileText } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { DocumentLink } from './DocumentLink.jsx';
import { BookReader } from './ui/BookReader.jsx';

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
  if (/\<[a-z][\s\S]*\>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

// Vista de lectura completa de un artículo de periódico/revista, mostrada
// como un libro paginado (ver BookReader) en vez de un scroll continuo. El
// listado (PublicationPage) solo muestra un resumen; aquí se lee el texto
// completo página por página, con la portada y el archivo adjunto (PDF/Word)
// si el admin subió uno.
export function ArticleReaderModal({ article, onClose }) {
  if (!article) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: '4vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '4vh', opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6 pb-4 flex-shrink-0 border-b border-edge">
          <div className="flex items-start gap-4 min-w-0">
            {article.coverImage && (
              <img
                src={resolveFileUrl(article.coverImage)}
                alt={article.title}
                className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-lg shadow-md flex-shrink-0"
              />
            )}
            <div className="min-w-0">
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
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink mt-1 truncate">{article.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-danger transition flex-shrink-0">
            <XCircle className="w-7 h-7" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col gap-3">
          <BookReader html={toContentHtml(article.content)} />

          {article.attachmentUrl && (
            <DocumentLink
              url={article.attachmentUrl}
              name={article.attachmentName}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline bg-accent-soft px-4 py-2 rounded-lg w-fit flex-shrink-0"
            >
              <FileText className="w-4 h-4" /> Ver {article.attachmentName || 'archivo adjunto'}
            </DocumentLink>
          )}
        </div>
      </motion.div>
    </div>
  );
}
