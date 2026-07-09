import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Sparkles, Calendar, Megaphone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BooksContext.jsx';
import { useEvents } from '../context/EventsContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import { useReadingPlans } from '../hooks/useReadingPlans.js';
import { BookGrid } from '../components/books/BookGrid.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function HomePage() {
  const { books, loading: booksLoading, setSelectedBook } = useBooks();
  const { events, loading: eventsLoading } = useEvents();
  const { profile } = useProfile();
  const { isAuthenticated } = useUserAuth();
  const { sayHi } = useMascot();
  const navigate = useNavigate();
  const { plans, loading: plansLoading } = useReadingPlans();

  useEffect(() => {
    if (isAuthenticated && profile && !booksLoading && !plansLoading) {
      const name = profile.name || 'Lector';
      let extra = '';
      if (plans.length > 0) {
        const inProgress = plans.find(p => {
          return p.books && p.books.some(b => !profile.read.some(r => r.bookId === b.bookId));
        });
        if (inProgress) {
          extra = `Tienes un plan de lectura en curso: "${inProgress.title}"`;
        }
      }
      sayHi(name, extra);
    }
  }, [isAuthenticated, profile, plans, booksLoading, plansLoading, sayHi]);

  if (booksLoading || eventsLoading) return <FullPageLoader label="Cargando BiblioSueños..." />;

  const staffPicks = books.filter((b) => b.isStaffPick).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-12">
      <header className="text-center py-20 bg-accent rounded-3xl shadow-xl text-accent-ink">
        <h1 className="text-6xl font-serif font-semibold mb-4 tracking-tight">BiblioSueños</h1>
        <p className="text-2xl font-light italic font-serif">Donde las palabras se encuentran con la imaginación.</p>
        <button
          onClick={() => navigate('/biblioteca')}
          className="mt-8 px-8 py-3 min-h-[44px] bg-surface text-accent font-semibold rounded-full shadow-lg hover:opacity-90 transition duration-300 transform hover:scale-105 flex items-center mx-auto"
        >
          <Book className="w-5 h-5 mr-2" /> Explorar la biblioteca
        </button>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-serif font-semibold text-ink flex items-center">
          <Sparkles className="w-7 h-7 mr-2 text-gold fill-gold" /> Selección del Staff
        </h2>
        <BookGrid books={staffPicks} onSelect={setSelectedBook} />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-serif font-semibold text-ink flex items-center">
          <Calendar className="w-7 h-7 mr-2 text-accent" /> Próximos Eventos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.slice(0, 2).map((event) => (
            <motion.div
              key={event.id}
              className="p-5 bg-surface rounded-xl shadow-sm border-l-4 border-accent flex items-start space-x-3"
            >
              <Megaphone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-serif font-semibold text-ink">{event.title}</h3>
                <p className="text-sm text-accent font-medium">
                  {new Date(event.date).toLocaleDateString('es-CO', { dateStyle: 'long' })}
                </p>
                <p className="text-ink-muted mt-1 line-clamp-2">{event.description}</p>
                <button
                  onClick={() => navigate('/eventos')}
                  className="mt-3 text-sm text-accent font-semibold hover:underline flex items-center min-h-[44px]"
                >
                  Descubrir más <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}