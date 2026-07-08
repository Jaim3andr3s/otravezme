import { api } from './api.js';

export const eventsService = {
  list: () => api.get('/events'),
  create: (data) => api.post('/events', data, { auth: 'admin' }),
  update: (id, data) => api.put(`/events/${id}`, data, { auth: 'admin' }),
  remove: (id) => api.delete(`/events/${id}`, { auth: 'admin' }),
};
