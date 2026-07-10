import { createContext, useContext, useState, useCallback } from 'react';
import { activitiesService } from '../services/activities.service.js';
import { useNotification } from './NotificationContext.jsx';

const ActivitiesContext = createContext(null);

export function ActivitiesProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await activitiesService.list();
      setActivities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    const activity = await activitiesService.create(data);
    setActivities((prev) => [activity, ...prev]);
    return activity;
  }, []);

  const update = useCallback(async (id, data) => {
    const activity = await activitiesService.update(id, data);
    setActivities((prev) => prev.map((a) => (a.id === id ? activity : a)));
    return activity;
  }, []);

  const remove = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta actividad? También se borrarán las entregas de los lectores.')) return;
      try {
        await activitiesService.remove(id);
        setActivities((prev) => prev.filter((a) => a.id !== id));
        showNotification('Actividad eliminada.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  const submit = useCallback(async (id, data) => {
    const submission = await activitiesService.submit(id, data);
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, mySubmission: submission } : a)));
    return submission;
  }, []);

  return (
    <ActivitiesContext.Provider value={{ activities, loading, error, reload, create, update, remove, submit }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error('useActivities debe usarse dentro de ActivitiesProvider');
  return ctx;
}
