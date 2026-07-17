import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, FileWarning } from 'lucide-react';
import { ReaderFrame } from './ReaderFrame.jsx';

const SWIPE_THRESHOLD = 60;

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

// Lector de PDF paginado: en vez de incrustar el visor nativo del navegador
// (con su propia barra de miniaturas/zoom/impresión), renderiza cada página
// del PDF como una imagen dentro de la misma tarjeta de lectura que usa el
// resto de la app, con la misma navegación de página que el lector de
// artículos.
export function PdfBookReader({ url }) {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const docRef = useRef(null);
  const renderTaskRef = useRef(null);
  const pageRef = useRef(1);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  pageRef.current = page;
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Proporción real de la página del PDF, para que la tarjeta se ajuste a
  // ese tamaño en vez de estirarse a ocupar todo el visor del modal.
  const [pageAspect, setPageAspect] = useState(null);
  // Se incrementa cada vez que un documento nuevo termina de cargar, para
  // forzar el efecto que dibuja la página incluso cuando la página sigue
  // siendo la 1 (setPage(1) no dispara su propio efecto si el valor no
  // cambió respecto al estado inicial).
  const [docVersion, setDocVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setPageCount(0);
    setPageAspect(null);
    loadPdfjs()
      .then((pdfjsLib) => pdfjsLib.getDocument({ url }).promise)
      .then((doc) => {
        if (cancelled) return;
        docRef.current = doc;
        setPageCount(doc.numPages);
        setPage(1);
        setDocVersion((v) => v + 1);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo cargar el PDF. Descárgalo para verlo.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      docRef.current?.destroy?.();
    };
  }, [url]);

  const renderPage = useCallback(async (num) => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    const container = viewportRef.current;
    if (!doc || !canvas || !container) return;
    setLoading(true);
    setError('');
    try {
      renderTaskRef.current?.cancel();
      const pdfPage = await doc.getPage(num);
      const unscaled = pdfPage.getViewport({ scale: 1 });
      // La proporción de la "hoja" se fija con la primera página del
      // documento y ya no se vuelve a tocar: si páginas más adelante tienen
      // otro tamaño (común en PDFs escaneados o con láminas sueltas), esa
      // página individual se acomoda centrada dentro del marco fijo en vez
      // de encoger/agrandar todo el marco al pasar de página.
      setPageAspect((prev) => (prev === null ? unscaled.width / unscaled.height : prev));
      const fitScale = Math.min(container.clientWidth / unscaled.width, container.clientHeight / unscaled.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pdfPage.getViewport({ scale: fitScale * dpr });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      const ctx = canvas.getContext('2d');
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        setError('No se pudo mostrar esta página.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (docRef.current) renderPage(page);
  }, [page, docVersion, renderPage]);

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      if (docRef.current) renderPage(pageRef.current);
    });
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (next) => {
    const clamped = Math.max(1, Math.min(pageCount, next));
    if (clamped === page) return;
    setDirection(clamped > page ? 1 : -1);
    setPage(clamped);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goTo(page + 1);
      if (e.key === 'ArrowLeft') goTo(page - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageCount]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(page + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(page - 1);
  };

  return (
    <div className="flex flex-col h-full flex-1 min-h-0">
      <ReaderFrame aspectRatio={pageAspect}>
        <div ref={viewportRef} className="relative h-full flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-ink-muted z-20 bg-surface">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 text-ink-muted z-20 bg-surface">
              <FileWarning className="w-10 h-10" />
              <p className="text-sm max-w-xs">{error}</p>
            </div>
          )}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              drag={pageCount > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="cursor-grab active:cursor-grabbing"
            >
              <canvas ref={canvasRef} className="shadow-md rounded-sm" />
            </motion.div>
          </AnimatePresence>
        </div>
      </ReaderFrame>

      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-ink-muted font-serif">
            Página {page} de {pageCount}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= pageCount}
            className="p-2 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
