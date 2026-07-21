import { api } from './api.js';

export const achievementsService = {
  list: () => api.get('/achievements'),
};
