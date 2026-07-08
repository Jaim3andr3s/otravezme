import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar.jsx';
import { NotificationToast } from '../ui/NotificationToast.jsx';
import { AchievementUnlockOverlay } from '../achievements/AchievementUnlockOverlay.jsx';
import { BookModal } from '../books/BookModal.jsx';
import { PublishBookForm } from '../admin/PublishBookForm.jsx';
import { useBooks } from '../../context/BooksContext.jsx';

export function AppShell() {
  const { books, selectedBook, setSelectedBook, editingBook, setEditingBook, vote, remove, update } = useBooks();
  const activeBook = selectedBook ? books.find((b) => b.id === selectedBook.id) || selectedBook : null;
  const { pathname } = useLocation();

  useEffect(() => {
    setSelectedBook(null);
    setEditingBook(null);
  }, [pathname, setSelectedBook, setEditingBook]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <NotificationToast />
      <AchievementUnlockOverlay />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {activeBook && (
          <BookModal
            book={activeBook}
            onClose={() => setSelectedBook(null)}
            onVote={vote}
            onDelete={remove}
            onEdit={(book) => {
              setSelectedBook(null);
              setEditingBook(book);
            }}
          />
        )}
      </AnimatePresence>
      {editingBook && (
        <PublishBookForm
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onPublish={(formData) => update(editingBook.id, formData)}
        />
      )}
    </div>
  );
}
