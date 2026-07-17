import { useState } from 'react';
import { Loader2, Target, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Field } from '../ui/Field.jsx';

const emptyState = { title: '', description: '', goalBooks: '', startDate: '', endDate: '' };

function toDateInput(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toISOString().slice(0, 10);
}

export function ManageChallengeForm({ onClose, onSave, challenge = null }) {
  const isEdit = Boolean(challenge);
  const [formData, setFormData] = useState(() => {
    if (challenge) {
      return {
        title: challenge.title,
        description: challenge.description,
        goalBooks: String(challenge.goalBooks),
        startDate: toDateInput(challenge.startDate),
        endDate: toDateInput(challenge.endDate),
      };
    }
    return emptyState;
  });
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
        goalBooks: parseInt(formData.goalBooks, 10),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
      setMessage(isEdit ? '¡Reto actualizado!' : '¡Reto creado!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Reto' : 'Nuevo Reto de Lectura'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Field label="Título del reto" required>
          <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del reto" required />
        </Field>
        <Field label="Descripción" required>
          <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" required className="h-16" />
        </Field>
        <Field label="Meta (número de libros)" required>
          <Input type="number" name="goalBooks" value={formData.goalBooks} onChange={handleChange} placeholder="Meta (número de libros)" required min="1" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de inicio" required>
            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </Field>
          <Field label="Fecha de fin" required>
            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </Field>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Reto'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}