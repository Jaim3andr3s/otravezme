import { useState, useEffect } from 'react';
import { Loader2, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { activitiesService } from '../../services/activities.service.js';
import { resolveFileUrl } from '../../services/api.js';
import { useNotification } from '../../context/NotificationContext.jsx';

function SubmissionRow({ submission, onReviewed }) {
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const isReviewed = submission.status === 'REVISADA';

  const handleReview = async () => {
    setSaving(true);
    try {
      const updated = await activitiesService.review(submission.activityId, submission.id, {
        status: 'REVISADA',
        feedback,
      });
      onReviewed(submission.id, updated);
      showNotification('Entrega marcada como revisada.', 'success');
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${isReviewed ? 'border-success/40 bg-success/5' : 'border-edge'}`}>
      <div className="flex items-center gap-2">
        <img src={submission.profile.avatar || undefined} alt="" className="w-8 h-8 rounded-full bg-surface-alt object-cover" />
        <span className="font-semibold text-ink text-sm">{submission.profile.name}</span>
        <span className="ml-auto text-xs flex items-center gap-1 text-ink-muted">
          {isReviewed ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5" />}
          {isReviewed ? 'Revisada' : 'Pendiente'}
        </span>
      </div>
      {submission.content && <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{submission.content}</p>}
      {submission.fileUrl && (
        <a
          href={resolveFileUrl(submission.fileUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mt-2"
        >
          <FileText className="w-3.5 h-3.5" /> Ver {submission.fileName || 'archivo entregado'}
        </a>
      )}
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Comentario para el lector (opcional)"
          disabled={isReviewed}
          className="flex-1 p-2 text-sm border border-edge rounded-lg bg-surface text-ink disabled:opacity-60"
        />
        {!isReviewed && (
          <button
            onClick={handleReview}
            disabled={saving}
            className="px-3 py-2 text-sm font-semibold bg-success text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Marcar revisada
          </button>
        )}
      </div>
    </div>
  );
}

export function ActivitySubmissionsModal({ activity, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    activitiesService
      .listSubmissions(activity.id)
      .then((data) => setSubmissions(data.map((s) => ({ ...s, activityId: activity.id }))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activity.id]);

  const handleReviewed = (id, updated) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  return (
    <Modal title={`Entregas: ${activity.title}`} onClose={onClose}>
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : error ? (
          <p className="text-danger text-sm">{error}</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">Nadie ha entregado esta actividad todavía.</p>
        ) : (
          submissions.map((s) => <SubmissionRow key={s.id} submission={s} onReviewed={handleReviewed} />)
        )}
      </div>
    </Modal>
  );
}
