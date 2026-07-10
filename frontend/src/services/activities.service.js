import { api } from './api.js';

export const activitiesService = {
  list: () => api.get('/activities', { auth: 'user' }),
  create: (data) => api.post('/activities', data, { auth: 'user' }),
  update: (id, data) => api.put(`/activities/${id}`, data, { auth: 'user' }),
  remove: (id) => api.delete(`/activities/${id}`, { auth: 'user' }),
  submit: (id, data) => api.post(`/activities/${id}/submit`, data, { auth: 'user' }),
  listSubmissions: (id) => api.get(`/activities/${id}/submissions`, { auth: 'user' }),
  review: (id, submissionId, data) => api.put(`/activities/${id}/submissions/${submissionId}/review`, data, { auth: 'user' }),
};
