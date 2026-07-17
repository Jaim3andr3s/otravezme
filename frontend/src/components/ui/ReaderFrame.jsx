import { useEffect, useRef, useState } from 'react';

// Marco de lectura simple: una tarjeta con el mismo lenguaje visual que el
// resto de la app (bordes, sombra suave, superficie), sin temática de libro.
// `aspectRatio`: si se pasa (ancho/alto real del documento, ej. una página
// de PDF), la tarjeta se ajusta a ese tamaño en vez de estirarse a ocupar
// todo el visor — así un documento vertical no queda chico en medio de una
// caja horizontal enorme.
//
// El tamaño se calcula en JS (midiendo el contenedor disponible) en vez de
// usar `aspect-ratio` de CSS directamente: combinado con un hijo (el
// lienzo del PDF) que se vuelve a montar en cada cambio de página, el
// cálculo automático de tamaño de CSS podía re-ajustarse por error al
// tamaño del lienzo recién montado (todavía sin su tamaño real) y la
// tarjeta se achicaba de golpe al pasar de página.
export function ReaderFrame({ children, aspectRatio }) {
  const outerRef = useRef(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const measure = () => {
      if (!aspectRatio) {
        setSize(null);
        return;
      }
      const { clientWidth, clientHeight } = outer;
      if (!clientWidth || !clientHeight) return;
      let width = clientWidth;
      let height = width / aspectRatio;
      if (height > clientHeight) {
        height = clientHeight;
        width = height * aspectRatio;
      }
      setSize({ width, height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [aspectRatio]);

  return (
    <div ref={outerRef} className="relative h-full w-full flex items-center justify-center">
      <div
        className="relative bg-surface border border-edge rounded-xl shadow-sm overflow-hidden"
        style={size ? { width: `${size.width}px`, height: `${size.height}px` } : { width: '100%', height: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}
