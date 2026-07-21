import { createContext, useContext } from 'react';
import { challengesService } from '../services/challenges.service.js';
import { useCrudService } from '../hooks/useCrudService.js';

const ChallengesContext = createContext(null);

export function ChallengesProvider({ children }) {
  const crud = useCrudService(challengesService);

  return (
    <ChallengesContext.Provider
      value={{
        challenges: crud.data,
        loading: crud.loading,
        error: crud.error,
        create: crud.create,
        update: crud.update,
        remove: crud.remove,
        reload: crud.reload,
      }}
    >
      {children}
    </ChallengesContext.Provider>
  );
}

export function useChallenges() {
  const ctx = useContext(ChallengesContext);
  if (!ctx) throw new Error('useChallenges debe usarse dentro de ChallengesProvider');
  return ctx;
}
