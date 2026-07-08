import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, XCircle, BookOpen, Target, Newspaper, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { useBooks } from '../context/BooksContext.jsx';
import { useEvents } from '../context/EventsContext.jsx';
import { plansService } from '../services/plans.service.js';
import { api } from '../services/api.js';
import { PublishBookForm } from '../components/admin/PublishBookForm.jsx';
import { CreateEventForm } from '../components/admin/CreateEventForm.jsx';
import { PublishPlanForm } from '../components/admin/PublishPlanForm.jsx';
import { ManageArticleForm } from '../components/admin/ManageArticleForm.jsx';
import { ManageChallengeForm } from '../components/admin/ManageChallengeForm.jsx';
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

  const handleCreateArticle = async (data) => {
    const article = await api.post('/publications', data, { auth: 'user' });
    navigate('/periodico');
    return article;
  };

  const handleCreateChallenge = async (data) => {
    const challenge = await api.post('/challenges', data, { auth: 'user' });
    navigate('/club-de-lectura/retos');
    return challenge;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="p-6 bg-surface border-l-4 border-accent rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <IconTile icon={ShieldCheck} className="bg-accent-soft text-accent" />
          <h2 className="text-3xl font-serif font-semibold text-accent">Panel de Administrador</h2>
        </div>
        <p className="text-sm text-ink-muted mb-6">Publica contenido nuevo o cierra tu sesión de administrador.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Biblioteca */}
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Biblioteca
            </h3>
            <Button variant="success" onClick={() => setModal('book')} className="w-full justify-center text-sm">
              <Plus className="w-4 h-4" /> Libro
            </Button>
          </div>

          {/* Club de lectura */}
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Club de lectura
            </h3>
            <div className="flex flex-col gap-2">
              <Button variant="pink" onClick={() => setModal('plan')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Plan Lector
              </Button>
              <Button variant="purple" onClick={() => setModal('challenge')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Reto de Lectura
              </Button>
            </div>
          </div>

          {/* Publicaciones */}
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <Newspaper className="w-4 h-4" /> Publicaciones
            </h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={() => setModal('article-periodico')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Periódico
              </Button>
              <Button variant="secondary" onClick={() => setModal('article-revista')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Revista Digital
              </Button>
            </div>
          </div>

          {/* Agenda */}
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Agenda
            </h3>
            <Button variant="primary" onClick={() => setModal('event')} className="w-full justify-center text-sm">
              <Plus className="w-4 h-4" /> Evento
            </Button>
          </div>

          {/* Salir */}
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <Button variant="secondary" onClick={handleLogout} className="w-full justify-center text-sm">
              <XCircle className="w-4 h-4" /> Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {modal === 'book' && <PublishBookForm onClose={() => setModal(null)} onPublish={handlePublishBook} />}
      {modal === 'plan' && <PublishPlanForm onClose={() => setModal(null)} onPublish={handlePublishPlan} />}
      {modal === 'event' && <CreateEventForm onClose={() => setModal(null)} onCreate={handleCreateEvent} />}
      {modal === 'challenge' && (
        <ManageChallengeForm
          onClose={() => setModal(null)}
          onSave={handleCreateChallenge}
        />
      )}
      {modal === 'article-periodico' && (
        <ManageArticleForm
          fixedType="PERIODICO"
          onClose={() => setModal(null)}
          onSave={handleCreateArticle}
        />
      )}
      {modal === 'article-revista' && (
        <ManageArticleForm
          fixedType="REVISTA"
          onClose={() => setModal(null)}
          onSave={handleCreateArticle}
        />
      )}
    </motion.div>
  );
}