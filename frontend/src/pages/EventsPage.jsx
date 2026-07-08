import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mic, BookOpenCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEvents } from '../context/EventsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';
import { EVENT_TYPE_LABEL } from '../constants/labels.js';

export default function EventsPage() {
  const { events, loading, error, create, update, remove } = useEvents();
  const { isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  if (loading) return <FullPageLoader label="Cargando eventos..." />;
  if (error) return <p className="text-danger text-center py-12">Error al cargar eventos: {error}</p>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <h2 className="text-4xl font-serif font-semibold text-ink">📣 Próximos Eventos ({events.length})</h2>
      <p className="text-lg text-ink-muted">Participa en nuestros clubes de lectura, talleres y cuentacuentos.</p>

      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="p-6 bg-surface border border-edge rounded-xl shadow-sm flex flex-col md:flex-row items-start transition-shadow hover:shadow-lg relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                <button
                  onClick={() => setEditingEvent(event)}
                  className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition"
                  title="Editar Evento"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => remove(event.id)}
                  className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition"
                  title="Eliminar Evento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
            <Calendar className="w-10 h-10 text-accent flex-shrink-0 mr-4 mt-1" />
            <div className="flex-grow">
              <h3 className="text-2xl font-serif font-semibold text-ink">{event.title}</h3>
              <p className="text-accent font-medium mb-2">
                {new Date(event.date).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <p className="text-ink-muted">{event.description}</p>
              <div className="mt-3">
                <Badge
                  text={EVENT_TYPE_LABEL[event.type] ?? event.type}
                  icon={event.type === 'CLUB_LECTURA' ? BookOpenCheck : Mic}
                  color="bg-accent-soft"
                  textColor="text-accent"
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
      {editingEvent && (
        <CreateEventForm
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onCreate={(data) => update(editingEvent.id, data)}
        />
      )}
    </motion.div>
  );
}
