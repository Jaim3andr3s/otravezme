import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { eventsService } from '../services/events.service.js';
import { useNotification } from './NotificationContext.jsx';

const EventsContext = createContext(null);

function byDateAsc(a, b) {
  return new Date(a.date) - new Date(b.date);
}

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.list();
      setEvents([...data].sort(byDateAsc));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (formData) => {
    const event = await eventsService.create(formData);
    setEvents((prev) => [...prev, event].sort(byDateAsc));
    return event;
  }, []);

  const update = useCallback(async (eventId, formData) => {
    const { event } = await eventsService.update(eventId, formData);
    setEvents((prev) => prev.map((e) => (e.id === eventId ? event : e)).sort(byDateAsc));
    return event;
  }, []);

  const remove = useCallback(
    async (eventId) => {
      if (!window.confirm('¿Eliminar este evento? Esta acción es irreversible.')) return;
      try {
        await eventsService.remove(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        showNotification('Evento eliminado exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar evento: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return (
    <EventsContext.Provider value={{ events, loading, error, create, update, remove, reload }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents debe usarse dentro de EventsProvider');
  return ctx;
}
