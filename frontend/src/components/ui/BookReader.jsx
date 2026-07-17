import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReaderFrame } from './ReaderFrame.jsx';

const PAGE_GAP = 40;
const SWIPE_THRESHOLD = 60;

// Pagina un bloque de HTML en "páginas" de tamaño fijo usando la técnica de
// columnas CSS: el contenido fluye en columnas del ancho del visor, y cada
// columna se comporta como una página de libro. Se navega deslizando la
// franja de columnas hacia la izquierda/derecha en vez de hacer scroll
// vertical, para que se sienta como pasar páginas y no como leer una web.
export function BookReader({ html }) {
  const viewportRef = useRef(null);
  const columnsRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageStride, setPageStride] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => setPageWidth(viewport.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!pageWidth || !columnsRef.current) return;
    const raf = requestAnimationFrame(() => {
      const totalWidth = columnsRef.current?.scrollWidth || pageWidth;
      const count = Math.max(1, Math.round(totalWidth / (pageWidth + PAGE_GAP)));
      // El navegador puede redondear el ancho real de cada columna de forma
      // distinta al valor que le pedimos; dividir el ancho total medido
      // entre el número de páginas evita que el borde de página corte
      // palabras por un desfase de unos pocos píxeles.
      setPageCount(count);
      setPageStride(totalWidth / count);
      setPage((p) => Math.min(p, count - 1));
    });
    return () => cancelAnimationFrame(raf);
  }, [pageWidth, html]);

  const goTo = useCallback((next) => {
    setPage((p) => {
      const clamped = Math.max(0, Math.min(pageCount - 1, next));
      return clamped;
    });
  }, [pageCount]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goTo(page + 1);
      if (e.key === 'ArrowLeft') goTo(page - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, goTo]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(page + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(page - 1);
  };

  const translateX = -(page * (pageStride || pageWidth + PAGE_GAP));

  return (
    <div className="flex flex-col h-full flex-1 min-h-0">
      <ReaderFrame>
        <div ref={viewportRef} className="relative h-full">
          <motion.div
            drag={pageCount > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            animate={{ x: translateX }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 260 }}
            className="h-full cursor-grab active:cursor-grabbing"
          >
            <div
              ref={columnsRef}
              style={{
                columnWidth: pageWidth ? `${pageWidth}px` : undefined,
                columnGap: `${PAGE_GAP}px`,
                columnFill: 'auto',
                display: 'inline-block',
                height: '100%',
                verticalAlign: 'top',
              }}
              className="py-6 px-6 sm:px-8 text-ink leading-relaxed [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-3 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-muted [&_blockquote]:mb-4 [&_a]:text-accent [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </motion.div>
        </div>
      </ReaderFrame>

      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-full bg-surface-alt text-ink disabled:opacity-30 hover:bg-accent-soft hover:text-accent transition"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-ink-muted font-serif">
            Página {page + 1} de {pageCount}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= pageCount - 1}
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
