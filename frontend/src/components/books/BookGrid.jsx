import { AnimatePresence } from 'framer-motion';
import { BookCard } from './BookCard.jsx';

export function BookGrid({ books, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {books.map((book) => (
          <BookCard key={book.id} book={book} onClick={onSelect} />
        ))}
      </AnimatePresence>
    </div>
  );
}
