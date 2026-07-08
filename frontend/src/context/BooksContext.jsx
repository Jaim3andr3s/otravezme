import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { booksService } from '../services/books.service.js';
import { useNotification } from './NotificationContext.jsx';

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksService.list();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const vote = useCallback(
    async (bookId, type) => {
      try {
        const { book } = await booksService.vote(bookId, type);
        setBooks((prev) => prev.map((b) => (b.id === bookId ? book : b)));
        setSelectedBook((prev) => (prev?.id === bookId ? book : prev));
        showNotification(`Voto registrado. Nuevo rating: ${book.rating}`, 'success');
      } catch (err) {
        showNotification(`Error al votar: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  const remove = useCallback(
    async (bookId) => {
      if (!window.confirm(`¿Eliminar el libro con ID ${bookId}? Esta acción es irreversible.`)) return;
      try {
        await booksService.remove(bookId);
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        setSelectedBook((prev) => (prev?.id === bookId ? null : prev));
        showNotification('Libro eliminado exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar libro: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  const create = useCallback(async (formData) => {
    const book = await booksService.create(formData);
    setBooks((prev) => [book, ...prev]);
    return book;
  }, []);

  const update = useCallback(
    async (bookId, formData) => {
      const { book } = await booksService.update(bookId, formData);
      setBooks((prev) => prev.map((b) => (b.id === bookId ? book : b)));
      setSelectedBook((prev) => (prev?.id === bookId ? book : prev));
      return book;
    },
    []
  );

  return (
    <BooksContext.Provider
      value={{
        books,
        loading,
        error,
        selectedBook,
        setSelectedBook,
        editingBook,
        setEditingBook,
        vote,
        remove,
        create,
        update,
        reload,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks debe usarse dentro de BooksProvider');
  return ctx;
}
