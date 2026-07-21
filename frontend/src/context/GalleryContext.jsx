import { createContext, useContext } from 'react';
import { galleryService } from '../services/gallery.service.js';
import { useCrudService } from '../hooks/useCrudService.js';

const GalleryContext = createContext(null);

export function GalleryProvider({ children }) {
  const crud = useCrudService(galleryService);

  return (
    <GalleryContext.Provider
      value={{
        images: crud.data,
        loading: crud.loading,
        error: crud.error,
        create: crud.create,
        update: crud.update,
        remove: crud.remove,
        reload: crud.reload,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery debe usarse dentro de GalleryProvider');
  return ctx;
}
