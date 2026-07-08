const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('bibliosuenos_user_token');
}

async function request(path, options = {}) {
  const { auth, ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  if (rest.body) headers['Content-Type'] = 'application/json';

  // Ahora todos los tokens son de usuario (unificados)
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers });

  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('bibliosuenos_user_token');
    }
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

export function setUserToken(token) {
  if (token) {
    localStorage.setItem('bibliosuenos_user_token', token);
  } else {
    localStorage.removeItem('bibliosuenos_user_token');
  }
}