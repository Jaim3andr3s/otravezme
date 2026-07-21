import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext.jsx';

export function useCrudService(service, { fetchOnMount = true, sortFn, confirmDelete } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const serviceRef = useRef(service);
  const sortFnRef = useRef(sortFn);
  const confirmDeleteRef = useRef(confirmDelete);
  serviceRef.current = service;
  sortFnRef.current = sortFn;
  confirmDeleteRef.current = confirmDelete;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceRef.current.list();
      const items = result?.data ?? result ?? [];
      setData(sortFnRef.current ? [...items].sort(sortFnRef.current) : items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchOnMount) reload();
  }, [reload, fetchOnMount]);

  const create = useCallback(async (formData) => {
    const item = await serviceRef.current.create(formData);
    setData((prev) => {
      const next = [item, ...prev];
      return sortFnRef.current ? next.sort(sortFnRef.current) : next;
    });
    return item;
  }, []);

  const update = useCallback(async (id, formData) => {
    const { data: updatedData, ...rest } = await serviceRef.current.update(id, formData);
    const item = updatedData ?? rest;
    setData((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...item } : d));
      return sortFnRef.current ? next.sort(sortFnRef.current) : next;
    });
    return item;
  }, []);

  const remove = useCallback(
    async (id, label = 'elemento') => {
      if (confirmDeleteRef.current !== false && !window.confirm(`¿Eliminar ${label}? Esta acción es irreversible.`)) return;
      try {
        await serviceRef.current.remove(id);
        setData((prev) => prev.filter((d) => d.id !== id));
        showNotification(`${label} eliminado exitosamente.`, 'success');
      } catch (err) {
        showNotification(`Error al eliminar: ${err.message}`, 'error');
      }
    },
    [showNotification]
  );

  return { data, setData, loading, error, reload, create, update, remove };
}
