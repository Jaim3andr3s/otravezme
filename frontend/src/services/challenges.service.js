import { api } from './api.js';

export const challengesService = {
  list: () => api.get('/challenges'),
  create: (data) => api.post('/challenges', data, { auth: 'user' }),
  update: (id, data) => api.put(`/challenges/${id}`, data, { auth: 'user' }),
  remove: (id) => api.delete(`/challenges/${id}`, { auth: 'user' }),
};
