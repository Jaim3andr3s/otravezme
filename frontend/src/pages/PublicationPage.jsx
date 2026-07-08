import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, BookOpen, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api.js';

const SECTIONS = {
  PERIODICO: [
    'Editorial',
    'Informativa',
    'Literatura',
    'Opinión',
    'Entretenimiento',
  ],
  REVISTA: [
    'Editorial',
    'Autor destacado',
    'Ficha de lectura',
    'Producciones literarias',
    'Pasatiempos literarios',
  ],
};

const TYPE_LABELS = {
  PERIODICO: 'Periódico',
  REVISTA: 'Revista Digital',
};

const TYPE_ICONS = {
  PERIODICO: Newspaper,
  REVISTA: BookOpen,
};

export default function PublicationPage() {
  const { type } = useParams(); // captura el tipo de la URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validTypes = Object.keys(TYPE_LABELS);
  const normalizedType = type?.toUpperCase();

  // Si el tipo no es válido, mostrar mensaje
  if (!validTypes.includes(normalizedType)) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-muted">Tipo de publicación no válido.</p>
      </div>
    );
  }

  const sections = SECTIONS[normalizedType] || [];
  const currentSection = searchParams.get('section') || sections[0];

  useEffect(() => {
    if (!currentSection) return;
    setLoading(true);
    setError(null);
    api
      .get(`/publications?type=${normalizedType}&section=${encodeURIComponent(currentSection)}`)
      .then(setArticles)
      .catch((err) => {
        console.error('Error al cargar publicaciones:', err);
        setError(err.message || 'Error al cargar las publicaciones.');
      })
      .finally(() => setLoading(false));
  }, [normalizedType, currentSection]);

  const handleSectionChange = (section) => {
    setSearchParams({ section });
  };

  const Icon = TYPE_ICONS[normalizedType];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-accent" />
          <h2 className="text-4xl font-serif font-semibold text-ink">
            {TYPE_LABELS[normalizedType]}
          </h2>
        </div>
        <p className="text-lg text-ink-muted">
          Explora las secciones de nuestro {TYPE_LABELS[normalizedType].toLowerCase()}.
        </p>
      </div>

      {/* Tabs de secciones */}
      <div className="flex flex-wrap gap-2 border-b border-edge pb-2">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => handleSectionChange(section)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              currentSection === section
                ? 'bg-accent text-accent-ink'
                : 'bg-surface-alt text-ink-muted hover:bg-accent-soft hover:text-accent'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-danger">Error al cargar: {error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-edge">
          <Newspaper className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <p className="text-ink-muted">No hay artículos en esta sección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {article.coverImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/800x400/E2E8F0/1F2937?text=Sin+imagen';
                    }}
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="font-semibold text-accent">{article.author}</span>
                  <span>·</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                  {article.edition && (
                    <>
                      <span>·</span>
                      <span className="bg-surface-alt px-2 py-0.5 rounded-full text-xs">
                        Ed. {article.edition}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-semibold text-ink">{article.title}</h3>
                <p className="text-ink-muted leading-relaxed">{article.content}</p>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
}