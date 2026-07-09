import { api } from './api.js';

export const challengesService = {
  list: () => api.get('/challenges'),
};