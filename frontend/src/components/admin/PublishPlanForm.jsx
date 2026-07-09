import { useState } from 'react';
import { Loader2, NotebookText, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';

const emptyState = { title: '', description: '', level: '', durationWeeks: '', books: '', documentUrl: '' };

export function PublishPlanForm({ onClose, onPublish, plan = null }) {
  const isEdit = Boolean(plan);
  const [formData, setFormData] = useState(() =>
    plan
      ? {
          title: plan.title,
          description: plan.description,
          level: plan.level,
          durationWeeks: String(plan.durationWeeks),
          books: JSON.stringify(plan.books, null, 2),
          documentUrl: plan.documentUrl || '',
        }
      : emptyState
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    let booksArray;
    try {
      booksArray = JSON.parse(formData.books);
      if (!Array.isArray(booksArray) || booksArray.length === 0 || !booksArray.every((item) => item.bookId && item.week)) {
        throw new Error('Formato incorrecto');
      }
    } catch {
      setMessage('El campo "Libros JSON" debe ser un array JSON válido: [{"bookId": 1, "week": 1, "note": "Nota"}].');
      return;
    }

    setLoading(true);
    try {
      await onPublish({
        ...formData,
        durationWeeks: parseInt(formData.durationWeeks, 10),
        books: booksArray,
        documentUrl: formData.documentUrl || undefined,
      });
      setMessage(isEdit ? '¡Plan de Lectura actualizado exitosamente!' : '¡Plan de Lectura publicado exitosamente!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Plan Lector' : 'Publicar Plan Lector'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <p className="text-xs text-ink-muted">* Campos obligatorios. La URL del Documento es opcional.</p>
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="* Título del Plan (Ej: Novelas para el Verano)" required />
        <Input name="level" value={formData.level} onChange={handleChange} placeholder="* Nivel (Ej: Básico, Intermedio, Adultos)" required />
        <Input type="number" name="durationWeeks" value={formData.durationWeeks} onChange={handleChange} placeholder="* Duración (Semanas)" required min="1" />
        <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="* Descripción breve del Plan" required className="h-16" />
        <Input type="url" name="documentUrl" value={formData.documentUrl} onChange={handleChange} placeholder="URL de Documento/PDF del Plan (Opcional)" />
        <Input
          as="textarea"
          name="books"
          value={formData.books}
          onChange={handleChange}
          placeholder='* Libros JSON. Ejemplo: [{"bookId": 1, "week": 1, "note": "Nota"}]'
          required
          className="h-24 font-mono text-xs"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : isEdit ? (
            <Save className="mr-2 w-5 h-5" />
          ) : (
            <NotebookText className="mr-2 w-5 h-5" />
          )}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Publicar Plan'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
