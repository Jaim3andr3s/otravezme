import { api } from './api.js';

export const authService = {
  // Admin (se mantiene por compatibilidad)
  login: (username, password) => api.post('/auth/login', { username, password }),

  // Usuarios
  loginWithGoogle: (credential) => api.post('/auth/google', { credential }),
  loginAsGuest: (guestToken) => api.post('/auth/guest', guestToken ? { guestToken } : {}),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  loginWithEmail: (email, password) =>
    api.post('/auth/login-email', { email, password }),

  // NUEVO: login unificado
  loginUnified: (email, password) =>
    api.post('/auth/login-unified', { email, password }),
};