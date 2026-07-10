import { useState } from 'react';
import { Loader2, Save, ClipboardList } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';

function toDateInputValue(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export function CreateActivityForm({ onClose, onSave, activity = null }) {
  const isEdit = Boolean(activity);
  const [formData, setFormData] = useState(() =>
    activity
      ? {
          title: activity.title,
          description: activity.description,
          dueDate: toDateInputValue(activity.dueDate),
          attachmentUrl: activity.attachmentUrl || '',
          attachmentName: activity.attachmentName || '',
        }
      : { title: '', description: '', dueDate: '', attachmentUrl: '', attachmentName: '' }
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate || undefined,
      });
      setMessage(isEdit ? '¡Actividad actualizada!' : '¡Actividad publicada!');
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Actividad' : 'Nueva Actividad'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <p className="text-xs text-ink-muted bg-accent-soft text-accent rounded-lg px-3 py-2">
          💡 Describe la tarea que deben entregar los lectores. Si quieres, adjunta una guía en foto, PDF o Word.
        </p>
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título de la actividad" required />
        <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Instrucciones para los lectores" required className="h-24" />
        <div>
          <label className="text-sm font-semibold text-ink block mb-1">Fecha límite (opcional)</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full p-3 border border-edge rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent bg-surface text-ink"
          />
        </div>
        <FileUploadField
          label="Archivo de apoyo (opcional)"
          kind="any"
          url={formData.attachmentUrl}
          name={formData.attachmentName}
          onUploaded={({ url, name }) => setFormData((prev) => ({ ...prev, attachmentUrl: url, attachmentName: name || prev.attachmentName }))}
          helpText="Una guía, plantilla o imagen de referencia para la actividad."
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : isEdit ? <Save className="mr-2 w-5 h-5" /> : <ClipboardList className="mr-2 w-5 h-5" />}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Publicar Actividad'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
