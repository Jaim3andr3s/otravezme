import { api } from './api.js';

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  loginWithGoogle: (credential) => api.post('/auth/google', { credential }),
  loginAsGuest: (guestToken) => api.post('/auth/guest', guestToken ? { guestToken } : {}),
};
