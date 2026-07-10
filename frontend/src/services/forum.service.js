import { api } from './api.js';

export const forumService = {
  list: () => api.get('/forum/posts', { auth: 'user' }),
  create: (data) => api.post('/forum/posts', data, { auth: 'user' }),
  remove: (id) => api.delete(`/forum/posts/${id}`, { auth: 'user' }),
  toggleLike: (id) => api.post(`/forum/posts/${id}/like`, {}, { auth: 'user' }),
  comment: (id, content) => api.post(`/forum/posts/${id}/comments`, { content }, { auth: 'user' }),
  removeComment: (postId, commentId) => api.delete(`/forum/posts/${postId}/comments/${commentId}`, { auth: 'user' }),
};
