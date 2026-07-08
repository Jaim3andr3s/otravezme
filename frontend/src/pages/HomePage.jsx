import { motion } from 'framer-motion';
import { Book, Sparkles, Calendar, Megaphone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BooksContext.jsx';
import { useEvents } from '../context/EventsContext.jsx';
import { BookGrid } from '../components/books/BookGrid.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function HomePage() {
  const { books, loading: booksLoading, setSelectedBook } = useBooks();
  const { events, loading: eventsLoading } = useEvents();
  const navigate = useNavigate();

  if (booksLoading || eventsLoading) return <FullPageLoader label="Cargando BiblioSueños..." />;

  const staffPicks = books.filter((b) => b.isStaffPick).slice(0, 4);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-12">
      <header className="text-center py-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl text-white">
        <h1 className="text-6xl font-extrabold mb-4">BiblioSueños</h1>
        <p className="text-2xl font-light">Donde las palabras se encuentran con la imaginación.</p>
        <button
          onClick={() => navigate('/biblioteca')}
          className="mt-8 px-8 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 flex items-center mx-auto"
        >
          <Book className="w-5 h-5 mr-2" /> Explorar la Biblioteca
        </button>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Sparkles className="w-7 h-7 mr-2 text-yellow-500 fill-yellow-500" /> Selección del Staff
        </h2>
        <BookGrid books={staffPicks} onSelect={setSelectedBook} />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Calendar className="w-7 h-7 mr-2 text-purple-500" /> Próximos Eventos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.slice(0, 2).map((event) => (
            <motion.div
              key={event.id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-purple-500 flex items-start space-x-3"
            >
              <Megaphone className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {new Date(event.date).toLocaleDateString('es-CO', { dateStyle: 'long' })}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{event.description}</p>
                <button
                  onClick={() => navigate('/eventos')}
                  className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
                >
                  Ver Detalles <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
