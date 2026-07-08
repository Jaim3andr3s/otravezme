import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mic, BookOpenCheck, Plus, Trash2 } from 'lucide-react';
import { useEvents } from '../context/EventsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';
import { EVENT_TYPE_LABEL } from '../constants/labels.js';

export default function EventsPage() {
  const { events, loading, error, create, remove } = useEvents();
  const { isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) return <FullPageLoader label="Cargando eventos..." />;
  if (error) return <p className="text-red-500 text-center py-12">Error al cargar eventos: {error}</p>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">📣 Próximos Eventos ({events.length})</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400">Participa en nuestros clubes de lectura, talleres y cuentacuentos.</p>

      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col md:flex-row items-start transition-shadow hover:shadow-xl relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isAdmin && (
              <button
                onClick={() => remove(event.id)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800 transition z-10"
                title="Eliminar Evento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <Calendar className="w-10 h-10 text-purple-500 flex-shrink-0 mr-4 mt-1" />
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                {new Date(event.date).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
              <div className="mt-3">
                <Badge
                  text={EVENT_TYPE_LABEL[event.type] ?? event.type}
                  icon={event.type === 'CLUB_LECTURA' ? BookOpenCheck : Mic}
                  color="bg-purple-100 dark:bg-purple-700/50"
                  textColor="text-purple-600 dark:text-purple-300"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex justify-center pt-8">
          <Button variant="purple" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" /> Crear Nuevo Evento
          </Button>
        </div>
      )}

      {showCreate && <CreateEventForm onClose={() => setShowCreate(false)} onCreate={create} />}
    </motion.div>
  );
}
