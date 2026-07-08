import { useCallback, useState } from 'react';
import { gamesService } from '../services/games.service.js';
import { useAchievements } from '../context/AchievementsContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export function useGameScore(game) {
  const [submitting, setSubmitting] = useState(false);
  const { announce } = useAchievements();
  const { reloadProfile } = useProfile();
  const { showNotification } = useNotification();

  const submitScore = useCallback(
    async (payload) => {
      setSubmitting(true);
      try {
        const { newAchievements } = await gamesService.submitScore(game, payload);
        await reloadProfile();
        announce(newAchievements);
      } catch (err) {
        showNotification(`No se pudo guardar tu puntaje: ${err.message}`, 'error');
      } finally {
        setSubmitting(false);
      }
    },
    [game, announce, reloadProfile, showNotification]
  );

  return { submitScore, submitting };
}
