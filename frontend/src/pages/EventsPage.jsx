import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mic, BookOpenCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEvents } from '../context/EventsContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';
import { IconTile } from '../components/ui/IconTile.jsx';
import { EVENT_TYPE_LABEL } from '../constants/labels.js';
import { resolveFileUrl } from '../services/api.js';

export default function EventsPage() {
  const { events, loading, error, create, update, remove } = useEvents();
  const { role } = useUserAuth();
  const isAdmin = role === 'admin';
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  if (loading) return <FullPageLoader label="Cargando eventos..." />;
  if (error) return <p className="text-danger text-center py-12">Error al cargar eventos: {error}</p>;

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-surface-alt border-2 border-edge flex items-center justify-center text-5xl">
            📅
          </div>
        </div>
        <p className="text-ink-muted font-serif italic text-lg">
          Todavía no hay eventos programados, ¡vuelve pronto!
        </p>
        {isAdmin && (
          <Button variant="purple" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" /> Añadir evento
          </Button>
        )}
        {showCreate && <CreateEventForm onClose={() => setShowCreate(false)} onCreate={create} />}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <IconTile icon={Calendar} size="sm" className="bg-purple-soft text-purple" />
            <h2 className="text-4xl font-serif font-semibold text-ink">Próximos Eventos ({events.length})</h2>
          </div>
          <p className="text-lg text-ink-muted">Participa en nuestros clubes de lectura, talleres y cuentacuentos.</p>
        </div>
        {isAdmin && (
          <Button variant="purple" onClick={() => setShowCreate(true)} className="flex-shrink-0">
            <Plus className="w-5 h-5" /> Añadir evento
          </Button>
        )}
      </div>

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
            {event.imageUrl ? (
              <img
                src={resolveFileUrl(event.imageUrl)}
                alt={event.title}
                className="w-full md:w-40 h-40 object-cover rounded-lg flex-shrink-0 mr-0 md:mr-4 mb-4 md:mb-0"
              />
            ) : (
              <Calendar className="w-10 h-10 text-accent flex-shrink-0 mr-4 mt-1" />
            )}
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