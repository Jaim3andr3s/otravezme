import { api } from './api.js';

export const booksService = {
  list: () => api.get('/books'),
  get: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data, { auth: 'admin' }),
  update: (id, data) => api.put(`/books/${id}`, data, { auth: 'admin' }),
  remove: (id) => api.delete(`/books/${id}`, { auth: 'admin' }),
  vote: (id, type) => api.post(`/books/${id}/vote`, { type }),
};
