import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from './NotificationContext.jsx';

const ArticlesContext = createContext(null);

export function ArticlesProvider({ children }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const [currentType, setCurrentType] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);

  const reload = useCallback(async (type, section) => {
    setLoading(true);
    setError(null);
    setCurrentType(type);
    setCurrentSection(section);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (section) params.append('section', section);
      const data = await api.get(`/publications?${params.toString()}`);
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    const article = await api.post('/publications', data, { auth: 'user' });
    setArticles((prev) => [article, ...prev]);
    return article;
  }, []);

  const update = useCallback(async (id, data) => {
    const article = await api.put(`/publications/${id}`, data, { auth: 'user' });
    setArticles((prev) => prev.map((a) => (a.id === id ? article : a)));
    return article;
  }, []);

  const remove = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar este artículo?')) return;
      try {
        await api.delete(`/publications/${id}`, { auth: 'user' });
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showNotification('Artículo eliminado exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar artículo: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return (
    <ArticlesContext.Provider value={{ articles, loading, error, create, update, remove, reload, currentType, currentSection }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error('useArticles debe usarse dentro de ArticlesProvider');
  return ctx;
}