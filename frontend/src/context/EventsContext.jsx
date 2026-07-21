import { createContext, useContext } from 'react';
import { eventsService } from '../services/events.service.js';
import { useCrudService } from '../hooks/useCrudService.js';

const EventsContext = createContext(null);

function byDateAsc(a, b) {
  return new Date(a.date) - new Date(b.date);
}

export function EventsProvider({ children }) {
  const crud = useCrudService(eventsService, { sortFn: byDateAsc });

  return (
    <EventsContext.Provider
      value={{
        events: crud.data,
        loading: crud.loading,
        error: crud.error,
        create: crud.create,
        update: crud.update,
        remove: crud.remove,
        reload: crud.reload,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents debe usarse dentro de EventsProvider');
  return ctx;
}
