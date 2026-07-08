import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { useBooks } from '../context/BooksContext.jsx';
import { useEvents } from '../context/EventsContext.jsx';
import { plansService } from '../services/plans.service.js';
import { PublishBookForm } from '../components/admin/PublishBookForm.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { PublishPlanForm } from '../components/admin/PublishPlanForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { IconTile } from '../components/ui/IconTile.jsx';

export default function AdminDashboardPage() {
  const { logout } = useUserAuth();
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

  const handlePublishBook = async (data) => {
    const book = await createBook(data);
    navigate('/biblioteca');
    return book;
  };

  const handleCreateEvent = async (data) => {
    const event = await createEvent(data);
    navigate('/eventos');
    return event;
  };

  const handlePublishPlan = async (data) => {
    const plan = await plansService.create(data);
    navigate('/planes-lectores');
    return plan;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="p-6 bg-surface border-l-4 border-accent rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <IconTile icon={ShieldCheck} className="bg-accent-soft text-accent" />
          <h2 className="text-3xl font-serif font-semibold text-accent">Panel de Administrador</h2>
        </div>
        <p className="text-sm text-ink-muted mb-6">Publica contenido nuevo o cierra tu sesión de administrador.</p>

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

      {modal === 'book' && <PublishBookForm onClose={() => setModal(null)} onPublish={handlePublishBook} />}
      {modal === 'event' && <CreateEventForm onClose={() => setModal(null)} onCreate={handleCreateEvent} />}
      {modal === 'plan' && <PublishPlanForm onClose={() => setModal(null)} onPublish={handlePublishPlan} />}
    </motion.div>
  );
}