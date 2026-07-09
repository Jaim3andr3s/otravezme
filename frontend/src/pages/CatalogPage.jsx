import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { useBooks } from '../context/BooksContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { BookGrid } from '../components/books/BookGrid.jsx';
import { PublishBookForm } from '../components/admin/PublishBookForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';
import { IconTile } from '../components/ui/IconTile.jsx';

export default function CatalogPage() {
  const { books, loading, error, setSelectedBook, create, update, remove } = useBooks();
  const { role } = useUserAuth();
  const isAdmin = role === 'admin';
  const [showPublish, setShowPublish] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  if (loading) return <FullPageLoader label="Cargando catálogo..." />;
  if (error) return <p className="text-danger text-center py-12">Error al cargar el catálogo: {error}</p>;

  const handleSetBookOfMonth = async (bookId) => {
    try {
      await update(bookId, { isBookOfMonth: true });
    } catch (err) {
      console.error('Error al marcar libro del mes:', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <IconTile icon={BookOpen} size="sm" className="bg-accent-soft text-accent" />
            <h2 className="text-4xl font-serif font-semibold text-ink">Biblioteca General ({books.length})</h2>
          </div>
          <p className="text-lg text-ink-muted">Explora nuestro catálogo completo de tesoros literarios.</p>
        </div>
        {isAdmin && (
          <Button variant="success" onClick={() => setShowPublish(true)} className="flex-shrink-0">
            <Plus className="w-5 h-5" /> Añadir libro
          </Button>
        )}
      </div>

      <BookGrid
        books={books}
        onSelect={setSelectedBook}
        onEdit={setEditingBook}
        onDelete={remove}
        onSetBookOfMonth={handleSetBookOfMonth}
        isAdmin={isAdmin}
      />

      {showPublish && <PublishBookForm onClose={() => setShowPublish(false)} onPublish={create} />}
      {editingBook && (
        <PublishBookForm
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onPublish={(data) => update(editingBook.id, data)}
        />
      )}
    </motion.div>
  );
}