import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, BookOpenCheck, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useBooks } from '../context/BooksContext.jsx';
import { BookCard } from '../components/books/BookCard.jsx';
import { BadgeTile } from '../components/achievements/BadgeTile.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { role } = useUserAuth();
  const { books, loading: booksLoading, setSelectedBook } = useBooks();

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (profileLoading || booksLoading || !profile) return <FullPageLoader label="Cargando tu perfil..." />;

  const favoriteBooks = books.filter((b) => profile.favorites.includes(b.id));
  const readBooks = books.filter((b) => profile.read.some((r) => r.bookId === b.id));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-10">
      <div className="bg-surface p-8 rounded-xl shadow-sm border border-edge flex flex-col md:flex-row items-center gap-6">
        <img src={profile.avatar} alt={`Avatar de ${profile.name}`} className="w-32 h-32 rounded-full border-4 border-accent p-1 bg-surface flex-shrink-0" />
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-serif font-semibold text-ink mb-1">{profile.name}</h2>
          <p className="text-xl text-accent font-medium mb-3">Lector Activo</p>
          <p className="text-ink-muted italic font-serif">&ldquo;{profile.bio}&rdquo;</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <Badge icon={Heart} text={`${favoriteBooks.length} Favoritos`} color="bg-danger-soft" textColor="text-danger" />
            <Badge icon={BookOpenCheck} text={`${readBooks.length} Leídos`} color="bg-accent-soft" textColor="text-accent" />
            <Badge icon={Calendar} text={`Miembro desde: ${new Date(profile.joinedAt).toLocaleDateString()}`} color="bg-surface-alt" textColor="text-ink-muted" />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-3xl font-serif font-semibold text-ink flex items-center">
          <Heart className="w-7 h-7 mr-2 text-danger fill-danger" /> Mis Libros Favoritos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteBooks.length > 0 ? (
            favoriteBooks.map((book) => <BookCard key={book.id} book={book} onClick={setSelectedBook} />)
          ) : (
            <p className="text-ink-muted col-span-full italic">Aún no has añadido ningún libro a tus favoritos.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-3xl font-serif font-semibold text-ink flex items-center">
          <BookOpenCheck className="w-7 h-7 mr-2 text-accent" /> Libros Leídos ({readBooks.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {readBooks.length > 0 ? (
            readBooks.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} onClick={setSelectedBook} />
                <div className="absolute top-0 left-0 bg-accent text-accent-ink text-xs font-bold px-2 py-1 rounded-br-lg shadow-lg">LEÍDO</div>
              </div>
            ))
          ) : (
            <p className="text-ink-muted col-span-full italic">¡Es hora de empezar a leer! Marca tus libros completados.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-serif font-semibold text-ink flex items-center">
            <Trophy className="w-7 h-7 mr-2 text-gold" /> Mis Insignias ({profile.achievements.length})
          </h3>
          <Link to="/juegos" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {profile.achievements.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {profile.achievements.map((achievement) => (
              <BadgeTile key={achievement.code} achievement={achievement} earned />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted italic">
            Aún no has ganado insignias.{' '}
            <Link to="/juegos" className="text-accent hover:underline">
              Juega y gana tu primera.
            </Link>
          </p>
        )}
      </section>
    </motion.div>
  );
}