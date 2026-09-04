import { motion } from 'framer-motion';
import { Book, ArrowRight, Sparkles } from 'lucide-react';

const SPARKLES = [
  { top: '6%', left: '30%', size: 12, delay: 0 },
  { top: '20%', left: '8%', size: 9, delay: 0.5 },
  { top: '48%', left: '2%', size: 10, delay: 1 },
  { top: '78%', left: '22%', size: 8, delay: 1.5 },
];

/**
 * Hero title block for the BiblioSueños home page.
 * Renders on top of the existing illustrated background (public/images/hero-bg.png);
 * the illustration itself is not modified here.
 */
export function HeroSection({ onExplore }) {
  return (
    <header
      className="relative overflow-hidden rounded-3xl shadow-xl min-h-[480px] md:min-h-[560px] flex items-center bg-[#FBF3DF] bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('/images/hero-bg.png')",
        backgroundPosition: 'right center',
      }}
    >
      {/* Readability scrim over the illustration so the text stays legible at any width */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, #FBF3DF 0%, rgba(251,243,223,0.94) 42%, rgba(251,243,223,0.55) 64%, rgba(251,243,223,0) 84%)',
        }}
      />

      {/* Decorative golden sparkles around the title */}
      {SPARKLES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-[#C98B00] pointer-events-none"
          style={{ top: s.top, left: s.left }}
          initial={{ opacity: 0.3, scale: 0.85 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.05, 0.85] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          <Sparkles size={s.size} fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}

      <div className="relative z-10 w-full px-6 sm:px-10 md:px-16 py-14 md:py-20">
        <div className="max-w-[560px]">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-bold leading-[0.95] tracking-tight text-[#182230] text-[9.5vw] sm:text-6xl md:text-7xl lg:text-[80px]"
          >
            <span className="hero-shimmer">B</span>iblio
            <span className="hero-shimmer">S</span>ueños
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 font-display italic text-[#C98B00] text-[28px] md:text-[32px] leading-snug"
          >
            Donde las palabras se encuentran con la imaginación.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-[480px] font-sans text-[#4B5563] text-[18px] md:text-[20px] leading-relaxed"
          >
            Explora historias, comparte ideas y descubre un universo lleno de libros,
            imaginación y aprendizaje para todas las edades.
          </motion.p>

          <motion.button
            type="button"
            onClick={onExplore}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -3, boxShadow: '0 14px 32px rgba(244,180,0,0.5)' }}
            whileTap={{ y: 0 }}
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#F4B400] text-white font-sans font-semibold px-8 py-4 min-h-[52px] shadow-[0_8px_24px_rgba(244,180,0,0.35)]"
          >
            <Book className="w-5 h-5" />
            Explorar la biblioteca
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
