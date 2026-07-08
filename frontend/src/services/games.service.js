import { api } from './api.js';
import { DEMO_PROFILE_ID } from './profile.service.js';

export const gamesService = {
  submitScore: (game, payload, profileId = DEMO_PROFILE_ID) =>
    api.post(`/profile/${profileId}/games/${game}/score`, payload),
};

export const achievementsService = {
  list: () => api.get('/achievements'),
};
