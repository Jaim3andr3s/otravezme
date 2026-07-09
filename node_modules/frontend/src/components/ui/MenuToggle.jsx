import { motion } from 'framer-motion';

export function MenuToggle({ open, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      className={`relative w-11 h-11 rounded-full bg-accent-soft text-accent shadow-sm ring-1 ring-accent/15 flex items-center justify-center transition-transform active:scale-95 lg:hidden ${className}`}
    >
      <motion.span
        className="absolute h-[2px] w-5 rounded-full bg-current"
        initial={false}
        animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
        transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.span
        className="absolute h-[2px] w-5 rounded-full bg-current"
        initial={false}
        animate={{ opacity: open ? 0 : 1, x: open ? 8 : 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute h-[2px] w-5 rounded-full bg-current"
        initial={false}
        animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
        transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
      />
    </button>
  );
}
