import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  CalendarClock,
  Users,
} from 'lucide-react';
import { useActivities } from '../context/ActivitiesContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { CreateActivityForm } from '../components/admin/CreateActivityForm.jsx';
import { ActivitySubmissionsModal } from '../components/admin/ActivitySubmissionsModal.jsx';
import { FileUploadField } from '../components/ui/FileUploadField.jsx';
import { resolveFileUrl } from '../services/api.js';

function SubmissionForm({ activity, onSubmit }) {
  const existing = activity.mySubmission;
  const [editing, setEditing] = useState(!existing);
  const [content, setContent] = useState(existing?.content || '');
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl || '');
  const [fileName, setFileName] = useState(existing?.fileName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isReviewed = existing?.status === 'REVISADA';

  if (existing && !editing) {
    return (
      <div className={`rounded-lg p-3 border ${isReviewed ? 'border-success/40 bg-success/5' : 'border-accent/40 bg-accent-soft/40'}`}>
        <p className="text-sm font-semibold flex items-center gap-1.5 text-ink">
          {isReviewed ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Clock className="w-4 h-4 text-accent" />}
          {isReviewed ? 'Revisada por el admin' : 'Entregada — esperando revisión'}
        </p>
        {existing.content && <p className="text-sm text-ink-muted mt-1 whitespace-pre-wrap">{existing.content}</p>}
        {existing.fileUrl && (
          <a href={resolveFileUrl(existing.fileUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline mt-1">
            <FileText className="w-3.5 h-3.5" /> Ver {existing.fileName || 'archivo entregado'}
          </a>
        )}
        {isReviewed && existing.feedback && (
          <p className="text-xs text-ink-muted mt-2 italic">💬 {existing.feedback}</p>
        )}
        {!isReviewed && (
          <button onClick={() => setEditing(true)} className="text-xs font-semibold text-accent hover:underline mt-2">
            Editar mi entrega
          </button>
        )}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await onSubmit(activity.id, { content: content || undefined, fileUrl: fileUrl || undefined, fileName: fileName || undefined });
      setEditing(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-edge pt-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu respuesta o comentario para esta actividad..."
        className="w-full p-3 border border-edge rounded-lg bg-surface-alt/40 text-ink resize-none h-20 focus:ring-2 focus:ring-accent focus:outline-none"
      />
      <FileUploadField
        label="Adjuntar foto, PDF o Word (opcional)"
        kind="any"
        url={fileUrl}
        name={fileName}
        onUploaded={({ url, name }) => {
          setFileUrl(url);
          setFileName(name || '');
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-accent text-accent-ink text-sm font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {existing ? 'Guardar cambios' : 'Entregar actividad'}
        </button>
        {existing && (
          <button type="button" onClick={() => setEditing(false)} className="text-sm text-ink-muted hover:underline">
            Cancelar
          </button>
        )}
      </div>
      {message && <p className="text-sm text-danger">{message}</p>}
    </form>
  );
}

function ActivityCard({ activity, isAdmin, onEdit, onDelete, onViewSubmissions, onSubmit }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-edge rounded-xl shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-serif font-semibold text-ink">{activity.title}</h3>
          {activity.dueDate && (
            <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
              <CalendarClock className="w-3.5 h-3.5" /> Entrega antes del {new Date(activity.dueDate).toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => onEdit(activity)} className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition" title="Editar">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(activity.id)} className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-ink-muted leading-relaxed whitespace-pre-wrap">{activity.description}</p>

      {activity.attachmentUrl && (
        <a
          href={resolveFileUrl(activity.attachmentUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline bg-accent-soft px-3 py-1.5 rounded-lg w-fit"
        >
          <FileText className="w-4 h-4" /> Ver {activity.attachmentName || 'guía adjunta'}
        </a>
      )}

      {isAdmin ? (
        <button
          onClick={() => onViewSubmissions(activity)}
          className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline pt-2"
        >
          <Users className="w-4 h-4" />
          Ver entregas ({activity.submissionCount}
          {activity.submissionCount > 0 && ` · ${activity.reviewedCount} revisadas`})
        </button>
      ) : (
        <SubmissionForm activity={activity} onSubmit={onSubmit} />
      )}
    </motion.div>
  );
}

export default function ActivitiesPage() {
  const { activities, loading, error, reload, create, update, remove, submit } = useActivities();
  const { role } = useUserAuth();
  const isAdmin = role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [viewingSubmissionsOf, setViewingSubmissionsOf] = useState(null);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-accent" />
          <div>
            <h1 className="text-3xl font-serif font-semibold text-ink">Actividades</h1>
            <p className="text-sm text-ink-muted">
              {isAdmin ? 'Publica tareas y revisa lo que entregan los lectores.' : 'Entrega tus tareas: escribe una respuesta o adjunta una foto, PDF o Word.'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Nueva actividad
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <p className="text-center text-danger py-8">{error}</p>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-edge">
          <ClipboardList className="w-14 h-14 text-ink-muted mx-auto mb-3" />
          <p className="text-ink-muted">{isAdmin ? 'Aún no has publicado ninguna actividad.' : 'No hay actividades por ahora. ¡Vuelve pronto!'}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isAdmin={isAdmin}
              onEdit={setEditingActivity}
              onDelete={remove}
              onViewSubmissions={setViewingSubmissionsOf}
              onSubmit={submit}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <CreateActivityForm onClose={() => setShowForm(false)} onSave={create} />}
        {editingActivity && (
          <CreateActivityForm
            activity={editingActivity}
            onClose={() => setEditingActivity(null)}
            onSave={(data) => update(editingActivity.id, data)}
          />
        )}
        {viewingSubmissionsOf && (
          <ActivitySubmissionsModal activity={viewingSubmissionsOf} onClose={() => setViewingSubmissionsOf(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
