import { STORAGE_KEYS } from '../constants/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || API_BASE_URL.replace(/\/api\/?$/, '');

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

async function request(path, options = {}) {
  const { ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  if (rest.body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, { ...rest, headers });

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthError(data?.message || 'Sesión inválida.');
    }
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

export function resolveFileUrl(pathOrUrl) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${API_ORIGIN}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

export async function uploadFile(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthError(data?.message || 'Sesión inválida.');
    }
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

export function setUserToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}
