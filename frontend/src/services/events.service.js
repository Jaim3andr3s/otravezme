import { api } from './api.js';

export const eventsService = {
  list: () => api.get('/events'),
  create: (data) => api.post('/events', data, { auth: 'user' }),
  update: (id, data) => api.put(`/events/${id}`, data, { auth: 'user' }),
  remove: (id) => api.delete(`/events/${id}`, { auth: 'user' }),
};