import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from './NotificationContext.jsx';

const ChallengesContext = createContext(null);

export function ChallengesProvider({ children }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/challenges');
      setChallenges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (data) => {
    const challenge = await api.post('/challenges', data, { auth: 'user' });
    setChallenges((prev) => [challenge, ...prev]);
    return challenge;
  }, []);

  const update = useCallback(async (id, data) => {
    const challenge = await api.put(`/challenges/${id}`, data, { auth: 'user' });
    setChallenges((prev) => prev.map((c) => (c.id === id ? challenge : c)));
    return challenge;
  }, []);

  const remove = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar este reto?')) return;
      try {
        await api.delete(`/challenges/${id}`, { auth: 'user' });
        setChallenges((prev) => prev.filter((c) => c.id !== id));
        showNotification('Reto eliminado exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar reto: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return (
    <ChallengesContext.Provider value={{ challenges, loading, error, create, update, remove, reload }}>
      {children}
    </ChallengesContext.Provider>
  );
}

export function useChallenges() {
  const ctx = useContext(ChallengesContext);
  if (!ctx) throw new Error('useChallenges debe usarse dentro de ChallengesProvider');
  return ctx;
}