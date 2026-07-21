import { createContext, useContext } from 'react';
import { activitiesService } from '../services/activities.service.js';
import { useCrudService } from '../hooks/useCrudService.js';

const ActivitiesContext = createContext(null);

export function ActivitiesProvider({ children }) {
  const crud = useCrudService(activitiesService);

  const submit = async (id, data) => {
    const submission = await activitiesService.submit(id, data);
    crud.setData((prev) => prev.map((a) => (a.id === id ? { ...a, mySubmission: submission } : a)));
    return submission;
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities: crud.data,
        loading: crud.loading,
        error: crud.error,
        reload: crud.reload,
        create: crud.create,
        update: crud.update,
        remove: crud.remove,
        submit,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error('useActivities debe usarse dentro de ActivitiesProvider');
  return ctx;
}
