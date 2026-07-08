import { api } from './api.js';

export const eventsService = {
  list: () => api.get('/events'),
  create: (data) => api.post('/events', data),
  remove: (id) => api.delete(`/events/${id}`),
};
