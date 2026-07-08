import { api } from './api.js';

export const plansService = {
  list: () => api.get('/reading-plans'),
  create: (data) => api.post('/reading-plans', data, { auth: 'user' }),
  update: (id, data) => api.put(`/reading-plans/${id}`, data, { auth: 'user' }),
  remove: (id) => api.delete(`/reading-plans/${id}`, { auth: 'user' }),
};