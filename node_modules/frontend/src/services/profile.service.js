import { api } from './api.js';

export const profileService = {
  getMe: () => api.get('/profile/me', { auth: 'user' }),
  updateMe: (data) => api.put('/profile/me', data, { auth: 'user' }),
  setFavorites: (favorites) => api.put('/profile/me/favorites', { favorites }, { auth: 'user' }),
  setRead: (read) => api.put('/profile/me/read', { read }, { auth: 'user' }),
  // NUEVO: obtener diplomas del usuario autenticado
  getDiplomas: () => api.get('/profile/me/diplomas', { auth: 'user' }),
};