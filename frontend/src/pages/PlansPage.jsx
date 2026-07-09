import { useState } from 'react';
import { motion } from 'framer-motion';
import { NotebookText, ChevronRight, Book, Globe, Pencil, Trash2, Plus, Wind } from 'lucide-react';
import { useReadingPlans } from '../hooks/useReadingPlans.js';
import { useBooks } from '../context/BooksContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { plansService } from '../services/plans.service.js';
import { PublishPlanForm } from '../components/admin/PublishPlanForm.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FullPageLoader } from '../components/ui/Spinner.jsx';

export default function PlansPage() {
  const { plans, setPlans, loading: plansLoading, error } = useReadingPlans();
  const { books, loading: booksLoading } = useBooks();
  const { role } = useUserAuth();
  const isAdmin = role === 'admin';
  const { showNotification } = useNotification();
  const [showPublish, setShowPublish] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handlePublish = async (formData) => {
    const plan = await plansService.create(formData);
    setPlans((prev) => [plan, ...prev]);
  };

  const handleUpdate = async (formData) => {
    const { plan } = await plansService.update(editingPlan.id, formData);
    setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? plan : p)));
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
  if (error) return <p className="text-danger text-center py-12">Error al cargar los planes: {error}</p>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
      {/* Encabezado con botón de admin en la parte superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-semibold text-ink">📚 Planes de Lectura ({plans.length})</h2>
          <p className="text-lg text-ink-muted">Guías de lectura estructurada para alcanzar tus metas literarias.</p>
        </div>
        {isAdmin && (
          <Button variant="pink" onClick={() => setShowPublish(true)} className="flex-shrink-0">
            <Plus className="w-5 h-5" /> Publicar Nuevo Plan Lector
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="p-6 bg-surface rounded-xl shadow-sm border-t-4 border-accent hover:shadow-lg transition-shadow relative"
              whileHover={{ y: -3 }}
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition"
                    title="Editar Plan"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition"
                    title="Eliminar Plan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              <NotebookText className="w-8 h-8 text-accent mb-3" />
              <h3 className="text-2xl font-serif font-semibold text-ink mb-2">{plan.title}</h3>
              <p className="text-ink-muted mb-4">{plan.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge text={`Nivel: ${plan.level}`} color="bg-accent-soft" textColor="text-accent" />
                <Badge text={`${plan.durationWeeks} Semanas`} color="bg-surface-alt" textColor="text-ink-muted" />
                <Badge text={`${plan.books.length} Libros`} icon={Book} color="bg-success-soft" textColor="text-success" />
              </div>

              <div className="mt-4">
                {plan.documentUrl && (
                  <a
                    href={plan.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-accent hover:underline flex items-center mb-4"
                  >
                    <Globe className="w-4 h-4 mr-1" /> Ver Documento del Plan
                  </a>
                )}

                <h4 className="text-sm font-semibold text-ink mb-2">Libros Destacados:</h4>
                <ul className="space-y-1 text-sm text-ink-muted">
                  {plan.books.slice(0, 3).map((item, index) => {
                    const bookDetail = books.find((b) => b.id === item.bookId);
                    return (
                      <li key={index} className="flex items-center">
                        <ChevronRight className="w-4 h-4 mr-1 text-accent" />
                        {bookDetail ? bookDetail.title : `Libro ID ${item.bookId} (No encontrado)`} (Semana {item.week})
                      </li>
                    );
                  })}
                  {plan.books.length > 3 && <li className="text-xs italic text-ink-muted">...y {plan.books.length - 3} más.</li>}
                </ul>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="md:col-span-3 text-center p-12 bg-surface-alt rounded-xl">
            <Wind className="w-12 h-12 text-ink-muted mx-auto mb-4" />
            <p className="text-ink-muted">No hay planes de lectura activos en este momento. ¡Vuelve pronto!</p>
          </div>
        )}
      </div>

      {showPublish && <PublishPlanForm onClose={() => setShowPublish(false)} onPublish={handlePublish} />}
      {editingPlan && <PublishPlanForm plan={editingPlan} onClose={() => setEditingPlan(null)} onPublish={handleUpdate} />}
    </motion.div>
  );
}