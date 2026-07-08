import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Loader2, Target, Trophy } from 'lucide-react';
import { challengesService } from '../services/challenges.service.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ReadingChallengesPage() {
  const { isAuthenticated } = useUserAuth();
  const { showNotification } = useNotification();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    challengesService.list()
      .then(data => setChallenges(data))
      .catch(err => {
        console.error('Error al cargar retos:', err);
        showNotification('Error al cargar los retos de lectura.', 'error');
      })
      .finally(() => setLoading(false));
  }, [showNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-4"
      >
        <Target className="w-16 h-16 text-ink-muted mx-auto" />
        <h2 className="text-4xl font-serif font-semibold text-ink">📚 Retos de Lectura</h2>
        <p className="text-ink-muted">No hay retos activos en este momento. ¡Vuelve pronto!</p>
      </motion.div>
    );
  }

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
          <Target className="w-8 h-8 text-accent" />
          Retos de Lectura
        </h2>
        <p className="text-lg text-ink-muted">
          Acepta el desafío y lee la cantidad de libros propuesta antes de que termine el plazo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const progress = challenge.progress;
          const isActive = new Date() >= new Date(challenge.startDate) && new Date() <= new Date(challenge.endDate);
          const isUpcoming = new Date() < new Date(challenge.startDate);
          const isCompleted = progress && progress.readCount >= challenge.goalBooks;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-edge rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-serif font-semibold text-ink">{challenge.title}</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isActive ? 'bg-success-soft text-success' :
                  isUpcoming ? 'bg-accent-soft text-accent' :
                  'bg-surface-alt text-ink-muted'
                }`}>
                  {isActive ? 'Activo' : isUpcoming ? 'Próximo' : 'Finalizado'}
                </span>
              </div>

              <p className="text-ink-muted text-sm">{challenge.description}</p>

              <div className="flex items-center gap-4 text-sm text-ink-muted">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(challenge.startDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(challenge.endDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-ink-muted" />
                <span className="font-semibold">{challenge.goalBooks} libros</span>
              </div>

              {isAuthenticated && progress ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Progreso</span>
                    <span className="font-semibold text-ink">{progress.readCount} / {challenge.goalBooks}</span>
                  </div>
                  <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isCompleted ? 'bg-gold' : 'bg-accent'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end text-xs text-ink-muted">
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-gold font-semibold">
                        <Trophy className="w-3 h-3" /> ¡Completado!
                      </span>
                    )}
                    {!isCompleted && isActive && (
                      <span>{progress.percentage}% completado</span>
                    )}
                    {isUpcoming && <span>Próximamente</span>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic">
                  {isAuthenticated ? 'No hay progreso disponible.' : 'Inicia sesión para ver tu progreso.'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}