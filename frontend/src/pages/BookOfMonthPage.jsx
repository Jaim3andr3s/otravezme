import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, Loader2, Calendar, BookOpenCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { StarRating } from '../components/books/StarRating.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export default function BookOfMonthPage() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/books')
      .then((books) => {
        const bookOfMonth = books.find((b) => b.isBookOfMonth === true);
        setBook(bookOfMonth || null);
      })
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
        <p className="text-danger">Error al cargar el libro del mes: {error}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-4"
      >
        <Book className="w-16 h-16 text-ink-muted mx-auto" />
        <h2 className="text-4xl font-serif font-semibold text-ink">📖 Libro del Mes</h2>
        <p className="text-ink-muted">No hay un libro destacado este mes. ¡Vuelve pronto!</p>
      </motion.div>
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
        <h2 className="text-4xl font-serif font-semibold text-ink flex items-center gap-3">
          <Star className="w-8 h-8 text-gold fill-gold" />
          📖 Libro del Mes
        </h2>
        <p className="text-lg text-ink-muted">Nuestra selección especial para este mes.</p>
      </div>

      <div className="bg-surface border-2 border-gold rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 p-8">
          <div className="flex-shrink-0 md:w-64">
            <img
              src={book.cover}
              alt={`Portada de ${book.title}`}
              className="w-full rounded-lg shadow-xl border-2 border-edge"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/360x560/E2E8F0/1F2937?text=Sin+Portada';
              }}
            />
          </div>

          <div className="flex-grow space-y-4">
            <Badge icon={Star} text="⭐ Selección del Mes" color="bg-gold" textColor="text-accent-ink" />
            <h3 className="text-3xl font-serif font-semibold text-ink">{book.title}</h3>
            <p className="text-xl text-accent font-medium">{book.author}</p>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-surface-alt px-3 py-1 rounded-full text-ink-muted">{book.category}</span>
              <span className="bg-surface-alt px-3 py-1 rounded-full text-ink-muted">{book.ageRange}</span>
            </div>

            <StarRating rating={book.rating} reviews={book.reviews} />

            <p className="text-ink-muted leading-relaxed">{book.description}</p>

            {book.readOnlineUrl && (
              <a
                href={book.readOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white rounded-full font-semibold hover:opacity-90 transition"
              >
                <BookOpenCheck className="w-5 h-5" />
                Leer en Línea
              </a>
            )}

            <div className="flex items-center gap-2 text-sm text-ink-muted pt-4 border-t border-edge">
              <Calendar className="w-4 h-4" />
              <span>Agregado el {new Date(book.dateAdded).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}