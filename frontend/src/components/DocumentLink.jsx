import { useState } from 'react';
import { DocumentViewerModal } from './DocumentViewerModal.jsx';

// Reemplazo directo de `<a href=... target="_blank">`: en vez de navegar
// fuera de la app (y que el navegador descargue Word/PDF), abre el archivo
// en un visor dentro de la misma página.
export function DocumentLink({ url, name, className, children }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <DocumentViewerModal url={url} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}
