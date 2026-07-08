import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { achievementsService } from '../services/games.service.js';

const AchievementsContext = createContext(null);

export function AchievementsProvider({ children }) {
  const [catalog, setCatalog] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    achievementsService
      .list()
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const announce = useCallback((newAchievements) => {
    if (!newAchievements || newAchievements.length === 0) return;
    setQueue((prev) => [...prev, ...newAchievements]);
  }, []);

  const dismissCurrent = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  return (
    <AchievementsContext.Provider value={{ catalog, current: queue[0] ?? null, announce, dismissCurrent }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements debe usarse dentro de AchievementsProvider');
  return ctx;
}
