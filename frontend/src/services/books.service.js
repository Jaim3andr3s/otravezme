import { api } from './api.js';

export const booksService = {
  list: () => api.get('/books'),
  get: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  remove: (id) => api.delete(`/books/${id}`),
  vote: (id, type) => api.post(`/books/${id}/vote`, { type }),
};
