import { createContext, useContext, useState, useCallback } from 'react';
import { forumService } from '../services/forum.service.js';
import { useNotification } from './NotificationContext.jsx';

const ForumContext = createContext(null);

export function ForumProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await forumService.list();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    const post = await forumService.create(data);
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const remove = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta publicación?')) return;
      try {
        await forumService.remove(id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showNotification('Publicación eliminada.', 'success');
      } catch (err) {
        showNotification(`Error al eliminar: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  const toggleLike = useCallback(async (id) => {
    // Actualización optimista: la UI responde de inmediato al toque de
    // "me gusta" sin esperar la respuesta del servidor.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      const updated = await forumService.toggleLike(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
      reload();
    }
  }, [showNotification, reload]);

  const addComment = useCallback(async (id, content) => {
    const updated = await forumService.comment(id, content);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const removeComment = useCallback(
    async (postId, commentId) => {
      try {
        const updated = await forumService.removeComment(postId, commentId);
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      } catch (err) {
        showNotification(`Error al eliminar comentario: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return (
    <ForumContext.Provider
      value={{ posts, loading, error, reload, create, remove, toggleLike, addComment, removeComment }}
    >
      {children}
    </ForumContext.Provider>
  );
}

export function useForum() {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error('useForum debe usarse dentro de ForumProvider');
  return ctx;
}
