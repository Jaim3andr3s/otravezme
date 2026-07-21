import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, FileWarning, ZoomIn, ZoomOut } from 'lucide-react';

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

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const RENDER_DEBOUNCE_MS = 160;
const DOUBLE_TAP_MS = 300;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Lector de PDF paginado: cada página se ajusta al ANCHO disponible (no a
// la página completa), que es lo que de verdad importa para poder leer el
// texto -- ajustar la página entera a la pantalla la deja del tamaño de una
// estampilla en documentos densos. El resultado puede ser más alto que el
// visor, así que se hace scroll vertical dentro de la página.
//
// El zoom se controla con gestos reales además de los botones: pellizcar
// con dos dedos, doble tap, o Ctrl/Cmd + rueda del mouse (trackpad pinch en
// desktop se reporta como wheel+ctrlKey). Mientras el gesto está en curso
// solo se aplica un `transform: scale()` de CSS sobre el canvas ya
// dibujado (barato, instantáneo); el re-render real en alta resolución con
// pdf.js se dispara con un pequeño debounce después de que el gesto se
// asienta, para no redibujar en cada frame de un pellizco.
export function PdfBookReader({ url }) {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const docRef = useRef(null);
  const renderTaskRef = useRef(null);
  const pageRef = useRef(1);
  const zoomRef = useRef(1);
  const renderedZoomRef = useRef(1);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [previewScale, setPreviewScale] = useState(1);
  pageRef.current = page;
  zoomRef.current = zoom;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setZoom(1);
    renderedZoomRef.current = 1;
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
      // Ancho disponible real (sin el padding/scrollbar del contenedor);
      // clientWidth ya excluye la scrollbar vertical.
      const fitWidthScale = container.clientWidth / unscaled.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const finalScale = fitWidthScale * zoomRef.current;
      const viewport = pdfPage.getViewport({ scale: finalScale * dpr });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      const ctx = canvas.getContext('2d');
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      renderedZoomRef.current = zoomRef.current;
      setPreviewScale(1);
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        setError('No se pudo mostrar esta página.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambio de página (o documento nuevo): re-render inmediato, se siente
  // como pasar de hoja y no debe sentirse con retraso.
  useEffect(() => {
    if (docRef.current) renderPage(page);
  }, [page, docVersion, renderPage]);

  // Cambio de zoom (botones, pellizco o rueda): la vista previa por CSS es
  // instantánea; el redibujado real en alta resolución espera un momento
  // por si vienen más cambios seguidos (evita redibujar de más durante un
  // pellizco o un scroll de rueda largo).
  useEffect(() => {
    setPreviewScale(zoomRef.current / (renderedZoomRef.current || 1));
    if (!docRef.current) return;
    const t = setTimeout(() => renderPage(pageRef.current), RENDER_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [zoom, renderPage]);

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
    setPage(clamped);
    if (viewportRef.current) viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

  const zoomIn = () => setZoom((z) => clamp(+(z + ZOOM_STEP).toFixed(2), MIN_ZOOM, MAX_ZOOM));
  const zoomOut = () => setZoom((z) => clamp(+(z - ZOOM_STEP).toFixed(2), MIN_ZOOM, MAX_ZOOM));

  // --- Ctrl/Cmd + rueda (trackpad pinch en desktop también llega como
  // wheel con ctrlKey=true) ---
  const onWheel = useCallback((e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.006;
    setZoom((z) => clamp(+(z + delta).toFixed(2), MIN_ZOOM, MAX_ZOOM));
  }, []);

  // --- Pellizco con dos dedos ---
  const pinchRef = useRef(null);
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: touchDistance(e.touches[0], e.touches[1]), startZoom: zoomRef.current };
    }
  }, []);
  const onTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const factor = dist / pinchRef.current.startDist;
      const target = clamp(pinchRef.current.startZoom * factor, MIN_ZOOM, MAX_ZOOM);
      setPreviewScale(target / (renderedZoomRef.current || 1));
      zoomRef.current = target;
    }
  }, []);
  const onTouchEnd = useCallback(
    (e) => {
      if (pinchRef.current && e.touches.length < 2) {
        pinchRef.current = null;
        setZoom(+zoomRef.current.toFixed(2));
      }
    },
    []
  );

  // --- Doble tap para acercar/alejar rápido ---
  const lastTapRef = useRef(0);
  const onTouchEndTap = useCallback((e) => {
    if (pinchRef.current || e.touches.length !== 0 || e.changedTouches.length !== 1) return;
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      setZoom(zoomRef.current > 1.4 ? 1 : 2);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, []);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0">
      <div
        ref={viewportRef}
        className="relative flex-1 min-h-0 overflow-auto rounded-xl border border-edge bg-surface-alt/40 touch-pan-y"
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={(e) => {
          onTouchEnd(e);
          onTouchEndTap(e);
        }}
      >
        {loading && (
          <div className="absolute top-2 right-2 z-20 bg-surface/90 rounded-full p-1.5 shadow">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 text-ink-muted z-20 bg-surface">
            <FileWarning className="w-10 h-10" />
            <p className="text-sm max-w-xs">{error}</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block mx-auto shadow-md select-none"
          style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
        />
      </div>

      {pageCount > 0 && (
        <div className="flex items-center justify-between pt-2 flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="p-1.5 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
              aria-label="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-ink-muted font-serif w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="p-1.5 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
              aria-label="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs sm:text-sm font-medium text-ink-muted font-serif">
            {page}/{pageCount}
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
