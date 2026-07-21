import { createContext, useContext, useState, useCallback } from 'react';
import { booksService } from '../services/books.service.js';
import { useCrudService } from '../hooks/useCrudService.js';
import { useNotification } from './NotificationContext.jsx';

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const { setData, ...crud } = useCrudService(booksService, { confirmDelete: false });
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const { showNotification } = useNotification();

  const vote = useCallback(
    async (bookId, type) => {
      try {
        const book = await booksService.vote(bookId, type);
        setData((prev) => prev.map((b) => (b.id === bookId ? book : b)));
        setSelectedBook((prev) => (prev?.id === bookId ? book : prev));
        showNotification(`Voto registrado. Nuevo rating: ${book.rating}`, 'success');
      } catch (err) {
        showNotification(`Error al votar: ${err.message}`, 'error');
      }
    },
    [showNotification, setData]
  );

  const remove = useCallback(
    async (bookId) => {
      if (!window.confirm(`¿Eliminar el libro con ID ${bookId}? Esta acción es irreversible.`)) return;
      try {
        await booksService.remove(bookId);
        setData((prev) => prev.filter((b) => b.id !== bookId));
        setSelectedBook((prev) => (prev?.id === bookId ? null : prev));
        showNotification('Libro eliminado exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar libro: ${err.message}`, 'error');
      }
    },
    [showNotification, setData]
  );

  return (
    <BooksContext.Provider
      value={{
        books: crud.data,
        loading: crud.loading,
        error: crud.error,
        selectedBook,
        setSelectedBook,
        editingBook,
        setEditingBook,
        vote,
        remove,
        create: crud.create,
        update: crud.update,
        reload: crud.reload,
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
