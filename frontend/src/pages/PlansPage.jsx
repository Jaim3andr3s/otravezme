import { useState } from 'react';
import { motion } from 'framer-motion';
import { NotebookText, ChevronRight, Book, Globe, Trash2, Plus, Wind } from 'lucide-react';
import { useReadingPlans } from '../hooks/useReadingPlans.js';
import { useBooks } from '../context/BooksContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { plansService } from '../services/plans.service.js';
import { PublishPlanForm } from '../components/admin/PublishPlanForm.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function PlansPage() {
  const { plans, setPlans, loading: plansLoading, error } = useReadingPlans();
  const { books, loading: booksLoading } = useBooks();
  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const [showPublish, setShowPublish] = useState(false);

  const handlePublish = async (formData) => {
    const plan = await plansService.create(formData);
    setPlans((prev) => [plan, ...prev]);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('¿Eliminar este plan de lectura? Esta acción es irreversible.')) return;
    try {
      await plansService.remove(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      showNotification('Plan de lectura eliminado exitosamente.', 'success');
    } catch (err) {
      showNotification(`Error al eliminar plan: ${err.message}`, 'error');
    }
  };

  if (plansLoading || booksLoading) return <FullPageLoader label="Cargando planes de lectura..." />;
  if (error) return <p className="text-red-500 text-center py-12">Error al cargar los planes: {error}</p>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">📚 Planes de Lectura</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400">Guías de lectura estructurada para alcanzar tus metas literarias.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-pink-500 hover:shadow-xl transition-shadow relative"
              whileHover={{ y: -3 }}
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 dark:bg-red-900 text-red-500 hover:bg-red-200 dark:hover:bg-red-800 transition z-10"
                  title="Eliminar Plan"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <NotebookText className="w-8 h-8 text-pink-500 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge text={`Nivel: ${plan.level}`} color="bg-pink-100 dark:bg-pink-700/50" textColor="text-pink-600 dark:text-pink-300" />
                <Badge text={`${plan.durationWeeks} Semanas`} color="bg-indigo-100 dark:bg-indigo-700/50" textColor="text-indigo-600 dark:text-indigo-300" />
                <Badge text={`${plan.books.length} Libros`} icon={Book} color="bg-emerald-100 dark:bg-emerald-700/50" textColor="text-emerald-600 dark:text-emerald-300" />
              </div>

              <div className="mt-4">
                {plan.documentUrl && (
                  <a
                    href={plan.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4"
                  >
                    <Globe className="w-4 h-4 mr-1" /> Ver Documento del Plan
                  </a>
                )}

                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Libros Destacados:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {plan.books.slice(0, 3).map((item, index) => {
                    const bookDetail = books.find((b) => b.id === item.bookId);
                    return (
                      <li key={index} className="flex items-center">
                        <ChevronRight className="w-4 h-4 mr-1 text-pink-500" />
                        {bookDetail ? bookDetail.title : `Libro ID ${item.bookId} (No encontrado)`} (Semana {item.week})
                      </li>
                    );
                  })}
                  {plan.books.length > 3 && <li className="text-xs italic text-gray-500">...y {plan.books.length - 3} más.</li>}
                </ul>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="md:col-span-3 text-center p-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Wind className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay planes de lectura activos en este momento. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex justify-center pt-8">
          <Button variant="pink" onClick={() => setShowPublish(true)}>
            <Plus className="w-5 h-5" /> Publicar Nuevo Plan Lector
          </Button>
        </div>
      )}

      {showPublish && <PublishPlanForm onClose={() => setShowPublish(false)} onPublish={handlePublish} />}
    </motion.div>
  );
}
