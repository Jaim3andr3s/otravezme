import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { profileService, DEMO_PROFILE_ID } from '../services/profile.service.js';
import { useNotification } from './NotificationContext.jsx';
import { useAchievements } from './AchievementsContext.jsx';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { announce } = useAchievements();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileService.get(DEMO_PROFILE_ID);
      setProfile(data);
    } catch (err) {
      showNotification(`No se pudo cargar el perfil: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isFavorite = useCallback((bookId) => profile?.favorites?.includes(bookId) ?? false, [profile]);
  const isRead = useCallback((bookId) => profile?.read?.some((r) => r.bookId === bookId) ?? false, [profile]);

  const toggleFavorite = useCallback(
    async (bookId) => {
      if (!profile) return;
      const already = isFavorite(bookId);
      const nextFavorites = already
        ? profile.favorites.filter((id) => id !== bookId)
        : [...profile.favorites, bookId];
      try {
        const { profile: updated, newAchievements } = await profileService.setFavorites(profile.id, nextFavorites);
        setProfile(updated);
        showNotification(already ? 'Eliminado de favoritos.' : 'Añadido a favoritos.', 'success');
        announce(newAchievements);
      } catch (err) {
        showNotification(`Error al actualizar favoritos: ${err.message}`, 'error');
      }
    },
    [profile, isFavorite, showNotification, announce]
  );

  const toggleRead = useCallback(
    async (bookId) => {
      if (!profile) return;
      const already = isRead(bookId);
      const nextRead = already
        ? profile.read.filter((r) => r.bookId !== bookId)
        : [...profile.read, { bookId, date: new Date().toISOString() }];
      try {
        const { profile: updated, newAchievements } = await profileService.setRead(profile.id, nextRead);
        setProfile(updated);
        showNotification(already ? 'Libro marcado como no leído.' : '¡Felicidades, libro completado!', 'success');
        announce(newAchievements);
      } catch (err) {
        showNotification(`Error al actualizar libros leídos: ${err.message}`, 'error');
      }
    },
    [profile, isRead, showNotification, announce]
  );

  return (
    <ProfileContext.Provider
      value={{ profile, loading, isFavorite, isRead, toggleFavorite, toggleRead, reloadProfile: loadProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile debe usarse dentro de ProfileProvider');
  return ctx;
}
