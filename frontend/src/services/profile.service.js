import { api } from './api.js';

export const DEMO_PROFILE_ID = 12345;

export const profileService = {
  get: (id = DEMO_PROFILE_ID) => api.get(`/profile/${id}`),
  update: (id, data) => api.put(`/profile/${id}`, data),
  setFavorites: (id, favorites) => api.put(`/profile/${id}/favorites`, { favorites }),
  setRead: (id, read) => api.put(`/profile/${id}/read`, { read }),
};
