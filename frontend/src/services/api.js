const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('bibliosuenos_user_token');
}

async function request(path, options = {}) {
  const { ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  if (rest.body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Construir URL completa
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  console.log(`🌐 ${rest.method || 'GET'} ${url}`);

  const response = await fetch(url, { ...rest, headers });

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

// Los archivos subidos (fotos, PDF, Word) se sirven desde /uploads en la raíz
// del backend, no bajo /api. Esta función arma la URL completa a partir de la
// ruta relativa que devuelve uploadFile(), y deja intactas las URLs externas
// que el admin pueda seguir pegando a mano (ej. imágenes de otro sitio).
export function resolveFileUrl(pathOrUrl) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${backendOrigin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

// Subida de archivos (fotos, PDF, Word) usada por los formularios de admin.
// No pasa por `request` porque el body es FormData: el navegador debe poner
// su propio Content-Type con el boundary, no "application/json".
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
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data; // { url, originalName, mimeType, size }
}

export function setUserToken(token) {
  if (token) {
    localStorage.setItem('bibliosuenos_user_token', token);
  } else {
    localStorage.removeItem('bibliosuenos_user_token');
  }
}