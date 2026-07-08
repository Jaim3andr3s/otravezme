import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { useBooks } from '../context/BooksContext.jsx';
import { useEvents } from '../context/EventsContext.jsx';
import { plansService } from '../services/plans.service.js';
import { PublishBookForm } from '../components/admin/PublishBookForm.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { PublishPlanForm } from '../components/admin/PublishPlanForm.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { create: createBook } = useBooks();
  const { create: createEvent } = useEvents();
  const [modal, setModal] = useState(null);

  const handleLogout = () => {
    logout();
    showNotification('Sesión de administrador cerrada.', 'info');
    navigate('/');
  };

  const handlePublishPlan = async (data) => {
    await plansService.create(data);
    showNotification('Plan de lectura publicado. Visítalo en "Planes Lectores".', 'success');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-red-700 dark:text-red-300 flex items-center mb-2">
          <ShieldCheck className="w-7 h-7 mr-2 fill-red-500" /> Panel de Administrador
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">Publica contenido nuevo o cierra tu sesión de administrador.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="success" onClick={() => setModal('book')}>
            <Plus className="w-4 h-4" /> Libro
          </Button>
          <Button variant="purple" onClick={() => setModal('event')}>
            <Plus className="w-4 h-4" /> Evento
          </Button>
          <Button variant="pink" onClick={() => setModal('plan')}>
            <Plus className="w-4 h-4" /> Plan Lector
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            <XCircle className="w-4 h-4" /> Salir
          </Button>
        </div>
      </div>

      {modal === 'book' && <PublishBookForm onClose={() => setModal(null)} onPublish={createBook} />}
      {modal === 'event' && <CreateEventForm onClose={() => setModal(null)} onCreate={createEvent} />}
      {modal === 'plan' && <PublishPlanForm onClose={() => setModal(null)} onPublish={handlePublishPlan} />}
    </motion.div>
  );
}
