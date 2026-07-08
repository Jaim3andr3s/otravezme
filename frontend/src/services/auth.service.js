import { api } from './api.js';

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
};
