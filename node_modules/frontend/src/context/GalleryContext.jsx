import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api.js';
import { useNotification } from './NotificationContext.jsx';

const GalleryContext = createContext(null);

export function GalleryProvider({ children }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/gallery');
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (data) => {
    const image = await api.post('/gallery', data, { auth: 'user' });
    setImages((prev) => [image, ...prev]);
    return image;
  }, []);

  const update = useCallback(async (id, data) => {
    const image = await api.put(`/gallery/${id}`, data, { auth: 'user' });
    setImages((prev) => prev.map((img) => (img.id === id ? image : img)));
    return image;
  }, []);

  const remove = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta imagen?')) return;
      try {
        await api.delete(`/gallery/${id}`, { auth: 'user' });
        setImages((prev) => prev.filter((img) => img.id !== id));
        showNotification('Imagen eliminada exitosamente.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar imagen: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return (
    <GalleryContext.Provider value={{ images, loading, error, create, update, remove, reload }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery debe usarse dentro de GalleryProvider');
  return ctx;
}