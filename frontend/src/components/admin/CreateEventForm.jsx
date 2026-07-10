import { useState } from 'react';
import { Loader2, Megaphone, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';
import { EVENT_TYPE_OPTIONS } from '../../constants/labels.js';

const emptyState = { title: '', date: '', description: '', type: 'CLUB_LECTURA', imageUrl: '' };

function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateEventForm({ onClose, onCreate, event = null }) {
  const isEdit = Boolean(event);
  const [formData, setFormData] = useState(() =>
    event
      ? {
          title: event.title,
          date: toDatetimeLocal(event.date),
          description: event.description,
          type: event.type,
          imageUrl: event.imageUrl || '',
        }
      : emptyState
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onCreate({ ...formData, date: new Date(formData.date).toISOString() });
      setMessage(isEdit ? '¡Evento actualizado!' : '¡Evento añadido!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Evento' : 'Añadir Evento'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del Evento" required />
        <Input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />

        <Input as="select" name="type" value={formData.type} onChange={handleChange}>
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Input>

        <Input
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción completa del evento"
          required
          className="h-16"
        />

        <FileUploadField
          label="Foto del evento (opcional)"
          kind="image"
          url={formData.imageUrl}
          onUploaded={({ url }) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          helpText="Aparece en la tarjeta del evento en la agenda."
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 min-h-[44px] bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : isEdit ? (
            <Save className="mr-2 w-5 h-5" />
          ) : (
            <Megaphone className="mr-2 w-5 h-5" />
          )}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Añadir evento'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}