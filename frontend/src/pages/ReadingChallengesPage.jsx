import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, BookOpen, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useChallenges } from '../context/ChallengesContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';
import { ManageChallengeForm } from '../components/admin/ManageChallengeForm.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function ReadingChallengesPage() {
  const { challenges, loading, error, create, update, remove } = useChallenges();
  const { isAuthenticated, role } = useUserAuth();
  const { react } = useMascot();
  const isAdmin = role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    challenges.forEach((challenge) => {
      if (challenge.completed && !notifiedRef.current.has(challenge.id)) {
        notifiedRef.current.add(challenge.id);
        react('reto_completo');
      }
    });
  }, [challenges, isAuthenticated, react]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;
  if (error) return <div className="text-center py-20"><p className="text-danger">Error: {error}</p></div>;

  if (challenges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-surface-alt border-2 border-edge flex items-center justify-center text-5xl">
            🎯
          </div>
        </div>
        <p className="text-ink-muted font-serif italic text-lg">
          Todavía no hay retos activos, ¡vuelve pronto!
        </p>
        {isAdmin && (
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" /> Añadir reto
          </Button>
        )}
        {showForm && (
          <ManageChallengeForm
            onClose={() => setShowForm(false)}
            onSave={create}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-semibold text-ink flex items-center gap-3">
            <Target className="w-8 h-8 text-accent" />
            Retos de Lectura
          </h2>
          <p className="text-lg text-ink-muted">
            {isAuthenticated
              ? 'Completa los retos y gana diplomas.'
              : 'Inicia sesión para ver tu progreso en los retos.'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" /> Añadir reto
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const progress = challenge.progress !== null ? challenge.progress : 0;
          const goal = challenge.goal || challenge.goalBooks;
          const percentage = goal > 0 ? Math.min((progress / goal) * 100, 100) : 0;
          const isCompleted = challenge.completed || progress >= goal;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-edge rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow relative"
            >
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                  <button
                    onClick={() => setEditingChallenge(challenge)}
                    className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition shadow-md"
                    title="Editar reto"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(challenge.id)}
                    className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition shadow-md"
                    title="Eliminar reto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-semibold text-ink">{challenge.title}</h3>
                  <p className="text-ink-muted mt-1">{challenge.description}</p>
                </div>
                {isCompleted && (
                  <span className="px-3 py-1 bg-success-soft text-success rounded-full text-xs font-semibold">
                    ✅ Completado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-ink-muted mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Meta: {goal} libros
                </span>
              </div>

              {isAuthenticated && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Progreso</span>
                    <span className="font-semibold text-ink">
                      {progress} / {goal} libros
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface-alt rounded-full overflow-hidden border border-edge">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-ink-muted text-right">
                    {percentage.toFixed(0)}% completado
                  </p>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-ink-muted italic">
                  Inicia sesión para ver tu progreso.
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {showForm && (
        <ManageChallengeForm
          onClose={() => setShowForm(false)}
          onSave={create}
        />
      )}
      {editingChallenge && (
        <ManageChallengeForm
          challenge={editingChallenge}
          onClose={() => setEditingChallenge(null)}
          onSave={(data) => update(editingChallenge.id, data)}
        />
      )}
    </motion.div>
  );
}