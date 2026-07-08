import { motion } from 'framer-motion';
import { Heart, BookOpenCheck, Calendar } from 'lucide-react';
import { useProfile } from '../context/ProfileContext.jsx';
import { useBooks } from '../context/BooksContext.jsx';
import { BookCard } from '../components/books/BookCard.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { books, loading: booksLoading, setSelectedBook } = useBooks();

  if (profileLoading || booksLoading || !profile) return <FullPageLoader label="Cargando tu perfil..." />;

  const favoriteBooks = books.filter((b) => profile.favorites.includes(b.id));
  const readBooks = books.filter((b) => profile.read.some((r) => r.bookId === b.id));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <img src={profile.avatar} alt={`Avatar de ${profile.name}`} className="w-32 h-32 rounded-full border-4 border-indigo-500 p-1 bg-white dark:bg-gray-700 flex-shrink-0" />
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
          <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-3">Lector Activo</p>
          <p className="text-gray-600 dark:text-gray-300 italic">&ldquo;{profile.bio}&rdquo;</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <Badge icon={Heart} text={`${favoriteBooks.length} Favoritos`} color="bg-red-100 dark:bg-red-900/50" textColor="text-red-600 dark:text-red-300" />
            <Badge icon={BookOpenCheck} text={`${readBooks.length} Leídos`} color="bg-blue-100 dark:bg-blue-900/50" textColor="text-blue-600 dark:text-blue-300" />
            <Badge icon={Calendar} text={`Miembro desde: ${new Date(profile.joinedAt).toLocaleDateString()}`} color="bg-gray-100 dark:bg-gray-700/50" />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Heart className="w-7 h-7 mr-2 text-red-500 fill-red-500" /> Mis Libros Favoritos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteBooks.length > 0 ? (
            favoriteBooks.map((book) => <BookCard key={book.id} book={book} onClick={setSelectedBook} />)
          ) : (
            <p className="text-gray-500 dark:text-gray-400 col-span-full italic">Aún no has añadido ningún libro a tus favoritos.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <BookOpenCheck className="w-7 h-7 mr-2 text-blue-500" /> Libros Leídos ({readBooks.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {readBooks.length > 0 ? (
            readBooks.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} onClick={setSelectedBook} />
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-lg">LEÍDO</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 col-span-full italic">¡Es hora de empezar a leer! Marca tus libros completados.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
