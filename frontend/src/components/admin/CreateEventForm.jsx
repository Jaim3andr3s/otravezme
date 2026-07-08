import { useState } from 'react';
import { Loader2, Megaphone } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { EVENT_TYPE_OPTIONS } from '../../constants/labels.js';

const initialState = { title: '', date: '', description: '', type: 'CLUB_LECTURA' };

export function CreateEventForm({ onClose, onCreate }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onCreate({ ...formData, date: new Date(formData.date).toISOString() });
      setMessage('¡Evento creado exitosamente!');
      setFormData(initialState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Crear Nuevo Evento" onClose={onClose}>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Megaphone className="mr-2 w-5 h-5" />}
          {loading ? 'Creando Evento...' : 'Crear Evento'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
