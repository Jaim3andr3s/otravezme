import { useState } from 'react';
import { Loader2, Rocket, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';

const emptyState = { title: '', author: '', category: '', cover: '', description: '', ageRange: '', readOnlineUrl: '' };

export function PublishBookForm({ onClose, onPublish, book = null }) {
  const isEdit = Boolean(book);
  const [formData, setFormData] = useState(() => (book ? { ...emptyState, ...book, readOnlineUrl: book.readOnlineUrl || '' } : emptyState));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onPublish(formData);
      setMessage(isEdit ? '¡Libro actualizado exitosamente!' : '¡Libro publicado exitosamente!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Libro' : 'Publicar Nuevo Libro'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del Libro" required />
        <Input name="author" value={formData.author} onChange={handleChange} placeholder="Autor" required />
        <Input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría (Ej: Fantasía, Novela)" required />
        <Input name="ageRange" value={formData.ageRange} onChange={handleChange} placeholder="Rango de Edad (Ej: 10-14 años)" required />
        <Input type="url" name="cover" value={formData.cover} onChange={handleChange} placeholder="URL de la Portada (Imagen)" required />
        <Input type="url" name="readOnlineUrl" value={formData.readOnlineUrl} onChange={handleChange} placeholder="URL de Lectura en Línea (Opcional)" />
        <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Descripción breve del libro" required className="h-24" />
        {isEdit && (
          <Input as="select" name="status" value={formData.status} onChange={handleChange}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="PRESTADO">Prestado</option>
          </Input>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-success text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : isEdit ? (
            <Save className="mr-2 w-5 h-5" />
          ) : (
            <Rocket className="mr-2 w-5 h-5" />
          )}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Publicar Libro'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
