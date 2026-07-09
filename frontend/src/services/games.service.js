import { api } from './api.js';

export const gamesService = {
  submitScore: (game, payload) => api.post(`/profile/me/games/${game}/score`, payload, { auth: 'user' }),
};

export const achievementsService = {
  list: () => api.get('/achievements'),
};
