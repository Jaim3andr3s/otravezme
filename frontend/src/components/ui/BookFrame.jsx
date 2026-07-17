// "Tapa" visual de libro reutilizable: un marco con degradado dorado, un
// marcapáginas de cinta y sombras de encuadernado/filo de páginas, para que
// cualquier contenido de lectura (texto paginado, PDF, Word) se vea como un
// libro abierto en vez de un documento plano.
export function BookFrame({ children }) {
  return (
    <div
      className="relative flex-1 min-h-0 rounded-2xl p-1.5 sm:p-2 shadow-xl"
      style={{ background: 'linear-gradient(155deg, var(--color-gold), rgba(0,0,0,0.22))' }}
    >
      <div className="absolute -top-1.5 right-6 sm:right-10 w-3 h-6 bg-pink rounded-b-sm shadow-sm z-20" aria-hidden="true" />

      <div className="relative h-full overflow-hidden rounded-lg sm:rounded-xl bg-surface-alt shadow-inner">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-5 sm:w-7 bg-gradient-to-r from-black/15 to-transparent z-10" aria-hidden="true" />
        <div
          className="pointer-events-none absolute right-0 top-1 bottom-1 w-1.5 z-10 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 2px, transparent 2px, transparent 5px)',
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}
