import { motion } from 'framer-motion';
import { XCircle, FileText } from 'lucide-react';
import { resolveFileUrl } from '../services/api.js';
import { DocumentLink } from './DocumentLink.jsx';

// Vista de lectura completa de un artículo de periódico/revista. El listado
// (PublicationPage) solo muestra un resumen; aquí se ve el texto completo,
// la portada en grande y el archivo adjunto (PDF/Word) si el admin subió uno.
export function ArticleReaderModal({ article, onClose }) {
  if (!article) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[160] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: '4vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '4vh', opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {article.coverImage && (
          <div className="w-full h-56 sm:h-72 overflow-hidden rounded-t-xl">
            <img src={resolveFileUrl(article.coverImage)} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
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
              <h2 className="text-3xl font-serif font-semibold text-ink mt-1">{article.title}</h2>
            </div>
            <button onClick={onClose} className="text-ink-muted hover:text-danger transition flex-shrink-0">
              <XCircle className="w-7 h-7" />
            </button>
          </div>

          {/\<[a-z][\s\S]*\>/i.test(article.content) ? (
            <div
              className="text-ink leading-relaxed prose prose-sm sm:prose-base max-w-none [&_*]:text-ink"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-ink leading-relaxed whitespace-pre-wrap">{article.content}</p>
          )}

          {article.attachmentUrl && (
            <DocumentLink
              url={article.attachmentUrl}
              name={article.attachmentName}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline bg-accent-soft px-4 py-2 rounded-lg"
            >
              <FileText className="w-4 h-4" /> Ver {article.attachmentName || 'archivo adjunto'}
            </DocumentLink>
          )}
        </div>
      </motion.div>
    </div>
  );
}
