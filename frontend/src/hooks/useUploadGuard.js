import { useState, useCallback } from 'react';

// Varios formularios de admin tienen más de un FileUploadField (por ejemplo
// portada + adjunto). Este hook lleva un contador de cuántas subidas están
// en curso en ese momento, para poder deshabilitar el botón de guardar y
// evitar que el formulario se envíe con una URL todavía vacía mientras el
// archivo termina de subirse.
export function useUploadGuard() {
  const [count, setCount] = useState(0);

  const onUploadingChange = useCallback((isUploading) => {
    setCount((c) => Math.max(0, c + (isUploading ? 1 : -1)));
  }, []);

  return { isUploading: count > 0, onUploadingChange };
}
