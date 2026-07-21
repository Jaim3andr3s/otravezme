import { api } from './api.js';

export const galleryService = {
  list: () => api.get('/gallery'),
  create: (data) => api.post('/gallery', data, { auth: 'user' }),
  update: (id, data) => api.put(`/gallery/${id}`, data, { auth: 'user' }),
  remove: (id) => api.delete(`/gallery/${id}`, { auth: 'user' }),
};
