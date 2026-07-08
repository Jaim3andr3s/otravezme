import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, BookOpen, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

const SECTIONS = {
  PERIODICO: ['Editorial', 'Informativa', 'Literatura', 'Opinión', 'Entretenimiento'],
  REVISTA: ['Editorial', 'Autor destacado', 'Ficha de lectura', 'Producciones literarias', 'Pasatiempos literarios'],
};

const TYPE_LABELS = {
  PERIODICO: 'Periódico',
  REVISTA: 'Revista Digital',
};

const TYPE_ICONS = {
  PERIODICO: Newspaper,
  REVISTA: BookOpen,
};

export default function PublicationPage({ type: propType }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determinar el tipo: primero de la prop, luego de la URL (fallback)
  const type = propType || (location.pathname.includes('/periodico') ? 'PERIODICO' : 
                            location.pathname.includes('/revista-digital') ? 'REVISTA' : null);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validTypes = Object.keys(TYPE_LABELS);
  const normalizedType = type?.toUpperCase();

  const sections = SECTIONS[normalizedType] || [];
  const currentSection = searchParams.get('section') || sections[0];
  const Icon = TYPE_ICONS[normalizedType];

  // ✅ useEffect de carga ANTES del return condicional
  useEffect(() => {
    if (!normalizedType || !validTypes.includes(normalizedType) || !currentSection) return;
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

  // ✅ Validación de tipo (después de hooks)
  if (!normalizedType || !validTypes.includes(normalizedType)) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-muted">Tipo de publicación no válido.</p>
      </div>
    );
  }

  const handleSectionChange = (section) => {
    setSearchParams({ section });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;
  if (error) return <div className="text-center py-20"><p className="text-danger">Error: {error}</p></div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-accent" />
          <h2 className="text-4xl font-serif font-semibold text-ink">{TYPE_LABELS[normalizedType]}</h2>
        </div>
        <p className="text-lg text-ink-muted">Explora las secciones de nuestro {TYPE_LABELS[normalizedType].toLowerCase()}.</p>
      </div>

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

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-edge">
          <Newspaper className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <p className="text-ink-muted">No hay artículos en esta sección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <motion.article key={article.id} className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {article.coverImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
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
                      <span className="bg-surface-alt px-2 py-0.5 rounded-full text-xs">Ed. {article.edition}</span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-semibold text-ink">{article.title}</h3>
                <p className="text-ink-muted leading-relaxed line-clamp-4">{article.content}</p>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
}