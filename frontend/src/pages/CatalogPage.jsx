import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useBooks } from '../context/BooksContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { BookGrid } from '../components/books/BookGrid.jsx';
import { PublishBookForm } from '../components/admin/PublishBookForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function CatalogPage() {
  const { books, loading, error, setSelectedBook, create } = useBooks();
  const { isAdmin } = useAuth();
  const [showPublish, setShowPublish] = useState(false);

  if (loading) return <FullPageLoader label="Cargando catálogo..." />;
  if (error) return <p className="text-danger text-center py-12">Error al cargar el catálogo: {error}</p>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <h2 className="text-4xl font-serif font-semibold text-ink">📚 Biblioteca General ({books.length})</h2>
      <p className="text-lg text-ink-muted">Explora nuestro catálogo completo de tesoros literarios.</p>

      <BookGrid books={books} onSelect={setSelectedBook} />

      {isAdmin && (
        <div className="flex justify-center pt-8">
          <Button variant="success" onClick={() => setShowPublish(true)}>
            <Plus className="w-5 h-5" /> Publicar Nuevo Libro
          </Button>
        </div>
      )}

      {showPublish && <PublishBookForm onClose={() => setShowPublish(false)} onPublish={create} />}
    </motion.div>
  );
}
