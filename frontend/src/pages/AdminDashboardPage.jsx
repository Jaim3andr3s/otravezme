import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, XCircle, BookOpen, Target, Newspaper, Calendar, MessageSquareText, ClipboardList } from 'lucide-react';
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
    navigate(article.publication === 'REVISTA' ? '/revista-digital' : '/periodico');
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
        <p className="text-sm text-ink-muted mb-6">Publica contenido nuevo o cierra tu sesión de administrador. Cada botón abre un formulario guiado, paso a paso — no necesitas saber nada técnico.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Biblioteca
            </h3>
            <p className="text-xs text-ink-muted mb-3">Añade un libro nuevo al catálogo con su portada, autor y descripción.</p>
            <Button variant="success" onClick={() => setModal('book')} className="w-full justify-center text-sm">
              <Plus className="w-4 h-4" /> Añadir libro
            </Button>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" /> Club de lectura
            </h3>
            <p className="text-xs text-ink-muted mb-3">Crea un plan lector (elige libros del catálogo por semana) o un reto para motivar a los lectores.</p>
            <div className="flex flex-col gap-2">
              <Button variant="pink" onClick={() => setModal('plan')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Plan lector
              </Button>
              <Button variant="purple" onClick={() => setModal('challenge')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Reto de lectura
              </Button>
            </div>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <Newspaper className="w-4 h-4" /> Publicaciones
            </h3>
            <p className="text-xs text-ink-muted mb-3">Redacta un artículo con foto de portada y, si quieres, un PDF o Word adjunto con el contenido completo.</p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={() => setModal('article-periodico')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Artículo de periódico
              </Button>
              <Button variant="secondary" onClick={() => setModal('article-revista')} className="w-full justify-center text-sm">
                <Plus className="w-4 h-4" /> Artículo de revista digital
              </Button>
            </div>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Agenda
            </h3>
            <p className="text-xs text-ink-muted mb-3">Programa un evento (taller, cuentacuentos, club de lectura) con fecha y foto.</p>
            <Button variant="primary" onClick={() => setModal('event')} className="w-full justify-center text-sm">
              <Plus className="w-4 h-4" /> Añadir evento
            </Button>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge flex flex-col justify-center">
            <Button variant="secondary" onClick={handleLogout} className="w-full justify-center text-sm">
              <XCircle className="w-4 h-4" /> Cerrar sesión
            </Button>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <MessageSquareText className="w-4 h-4" /> Foro
            </h3>
            <p className="text-xs text-ink-muted mb-3">Publica anuncios en el muro de la comunidad y modera comentarios de los lectores.</p>
            <Button variant="secondary" onClick={() => navigate('/foro')} className="w-full justify-center text-sm">
              Ir al foro
            </Button>
          </div>

          <div className="bg-surface-alt p-4 rounded-lg border border-edge">
            <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-1 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Actividades
            </h3>
            <p className="text-xs text-ink-muted mb-3">Publica tareas para los lectores y revisa lo que te entregan (texto, fotos o documentos).</p>
            <Button variant="secondary" onClick={() => navigate('/actividades')} className="w-full justify-center text-sm">
              Ir a actividades
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