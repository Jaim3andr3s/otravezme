import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAchievements } from '../../context/AchievementsContext.jsx';
import { useMascot } from '../../context/MascotContext.jsx';
import { getAchievementIcon } from '../../constants/achievementIcons.js';

export function AchievementUnlockOverlay() {
  const { current, dismissCurrent } = useAchievements();
  const { react } = useMascot();
  const reduceMotion = useReducedMotion();
  const notifiedRef = useRef(null);

  // Notificar a Sofi cuando se desbloquea una nueva insignia
  useEffect(() => {
    if (current && current.code !== notifiedRef.current) {
      react('logro');
      notifiedRef.current = current.code;
    }
  }, [current, react]);

  useEffect(() => {
    if (!current) return undefined;
    const timer = setTimeout(dismissCurrent, 4200);
    return () => clearTimeout(timer);
  }, [current, dismissCurrent]);

  const Icon = current ? getAchievementIcon(current.icon) : null;
  const cardMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { scale: 0.6, y: 30, opacity: 0, rotate: -6 },
        animate: { scale: 1, y: 0, opacity: 1, rotate: 0 },
        exit: { scale: 0.7, y: 20, opacity: 0 },
        transition: { type: 'spring', stiffness: 260, damping: 18 },
      };
  const badgeMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.1, duration: 0.2 } }
    : {
        initial: { rotate: -20 },
        animate: { rotate: 0 },
        transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 12 },
      };

  return (
    <AnimatePresence>
      {current && (
        <motion.button
          key={current.code}
          type="button"
          onClick={dismissCurrent}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-sm cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div className="relative flex flex-col items-center gap-4 px-10 py-10 max-w-xs mx-4" {...cardMotion}>
            <p className="text-sm uppercase tracking-[0.2em] text-gold font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Insignia desbloqueada
            </p>

            <motion.div
              className="relative w-28 h-28 rounded-full bg-gradient-to-b from-gold to-accent shadow-2xl flex items-center justify-center border-4 border-surface"
              {...badgeMotion}
            >
              <div className="absolute inset-1 rounded-full border-2 border-white/30" />
              <Icon className="w-12 h-12 text-white drop-shadow" />
            </motion.div>

            <h3 className="text-2xl font-serif font-semibold text-white text-center">{current.title}</h3>
            <p className="text-xs text-white/70 text-center">Toca para continuar</p>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}