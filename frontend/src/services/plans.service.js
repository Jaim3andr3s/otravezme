import { api } from './api.js';

export const plansService = {
  list: () => api.get('/reading-plans'),
  create: (data) => api.post('/reading-plans', data),
  remove: (id) => api.delete(`/reading-plans/${id}`),
};
