import { useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';

const initialState = { title: '', author: '', category: '', cover: '', description: '', ageRange: '', readOnlineUrl: '' };

export function PublishBookForm({ onClose, onPublish }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onPublish(formData);
      setMessage('¡Libro publicado exitosamente!');
      setFormData(initialState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Publicar Nuevo Libro" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del Libro" required />
        <Input name="author" value={formData.author} onChange={handleChange} placeholder="Autor" required />
        <Input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría (Ej: Fantasía, Novela)" required />
        <Input name="ageRange" value={formData.ageRange} onChange={handleChange} placeholder="Rango de Edad (Ej: 10-14 años)" required />
        <Input type="url" name="cover" value={formData.cover} onChange={handleChange} placeholder="URL de la Portada (Imagen)" required />
        <Input type="url" name="readOnlineUrl" value={formData.readOnlineUrl} onChange={handleChange} placeholder="URL de Lectura en Línea (Opcional)" />
        <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Descripción breve del libro" required className="h-24" />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2 w-5 h-5" />}
          {loading ? 'Publicando...' : 'Publicar Libro'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
