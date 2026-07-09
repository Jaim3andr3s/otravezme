import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2, Lock } from 'lucide-react';
import { BadgeTile } from '../components/achievements/BadgeTile.jsx';
import { achievementsService } from '../services/games.service.js';
import { profileService } from '../services/profile.service.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function BadgesPage() {
  const { isAuthenticated } = useUserAuth();
  const { showNotification } = useNotification();
  const [catalog, setCatalog] = useState([]);
  const [earnedCodes, setEarnedCodes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Cargar catálogo de insignias
        const achievements = await achievementsService.list();
        setCatalog(achievements);

        // Si el usuario está autenticado, cargar su perfil para saber cuáles tiene
        if (isAuthenticated) {
          try {
            const profile = await profileService.getMe();
            const earned = new Set((profile?.achievements ?? []).map((a) => a.code));
            setEarnedCodes(earned);
          } catch (err) {
            // Si falla, simplemente no mostramos las ganadas
            console.warn('No se pudo cargar el perfil para insignias:', err);
          }
        }
      } catch (err) {
        showNotification('Error al cargar las insignias: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, showNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const earnedCount = earnedCodes.size;
  const totalCount = catalog.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-serif font-semibold text-ink flex items-center gap-3">
          <Trophy className="w-8 h-8 text-gold" />
          Insignias
        </h2>
        <p className="text-lg text-ink-muted">
          {isAuthenticated
            ? `Has ganado ${earnedCount} de ${totalCount} insignias.`
            : 'Inicia sesión para ver tu progreso.'}
        </p>
      </div>

      {catalog.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-edge">
          <Lock className="w-16 h-16 text-ink-muted mx-auto mb-4" />
          <p className="text-ink-muted">No hay insignias disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {catalog.map((achievement) => (
            <BadgeTile
              key={achievement.code}
              achievement={achievement}
              earned={earnedCodes.has(achievement.code)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}