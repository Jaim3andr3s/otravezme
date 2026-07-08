import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/gallery')
      .then(setImages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-danger">Error al cargar la galería: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-serif font-semibold text-ink">🖼️ Galería de Imágenes</h2>
        <p className="text-lg text-ink-muted">Un recorrido visual por nuestra comunidad literaria.</p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-edge">
          <ImageIcon className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <p className="text-ink-muted">No hay imágenes en la galería todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <motion.div
              key={image.id}
              className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={image.url}
                alt={image.caption || 'Imagen de la galería'}
                className="w-full aspect-[4/3] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x450/E2E8F0/1F2937?text=Imagen+no+disponible';
                }}
              />
              {image.caption && (
                <div className="p-4">
                  <p className="text-sm text-ink-muted font-serif italic">{image.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}