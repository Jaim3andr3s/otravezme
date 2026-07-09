import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { profileService } from '../services/profile.service.js';
import { useNotification } from './NotificationContext.jsx';
import { useAchievements } from './AchievementsContext.jsx';
import { useUserAuth } from './UserAuthContext.jsx';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isAuthenticated, role, logout } = useUserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { announce } = useAchievements();

  // Funciones para consultar estado sin cargar el perfil completo
  const isFavorite = useCallback(
    (bookId) => profile?.favorites?.includes(bookId) ?? false,
    [profile]
  );

  const isRead = useCallback(
    (bookId) => profile?.read?.some((r) => r.bookId === bookId) ?? false,
    [profile]
  );

  const loadProfile = useCallback(async () => {
    // Si no está autenticado o es administrador, no cargamos perfil (evita 401)
    if (!isAuthenticated || role === 'admin') {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await profileService.getMe();
      setProfile(data);
    } catch (err) {
      // Si el token es inválido, cerramos sesión
      if (err.status === 401 || err.message?.includes('401')) {
        setProfile(null);
        logout(); // limpia token y estado
      } else {
        showNotification(`No se pudo cargar el perfil: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role, logout, showNotification]);

  // Cargar perfil al montar y cuando cambien las dependencias
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Alternar favorito
  const toggleFavorite = useCallback(
    async (bookId) => {
      if (!profile) {
        showNotification('Inicia sesión para guardar tus favoritos.', 'info');
        return;
      }
      const already = isFavorite(bookId);
      const nextFavorites = already
        ? profile.favorites.filter((id) => id !== bookId)
        : [...profile.favorites, bookId];

      try {
        const { profile: updated, newAchievements } = await profileService.setFavorites(nextFavorites);
        setProfile(updated);
        showNotification(already ? 'Eliminado de favoritos.' : 'Añadido a favoritos.', 'success');
        if (newAchievements && newAchievements.length > 0) {
          announce(newAchievements);
        }
      } catch (err) {
        showNotification(`Error al actualizar favoritos: ${err.message}`, 'error');
      }
    },
    [profile, isFavorite, showNotification, announce]
  );

  // Alternar libro leído
  const toggleRead = useCallback(
    async (bookId) => {
      if (!profile) {
        showNotification('Inicia sesión para guardar tu progreso de lectura.', 'info');
        return;
      }
      const already = isRead(bookId);
      const nextRead = already
        ? profile.read.filter((r) => r.bookId !== bookId)
        : [...profile.read, { bookId, date: new Date().toISOString() }];

      try {
        const { profile: updated, newAchievements } = await profileService.setRead(nextRead);
        setProfile(updated);
        showNotification(already ? 'Libro marcado como no leído.' : '¡Felicidades, libro completado!', 'success');
        if (newAchievements && newAchievements.length > 0) {
          announce(newAchievements);
        }
      } catch (err) {
        showNotification(`Error al actualizar libros leídos: ${err.message}`, 'error');
      }
    },
    [profile, isRead, showNotification, announce]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        isFavorite,
        isRead,
        toggleFavorite,
        toggleRead,
        reloadProfile: loadProfile,
      }}
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