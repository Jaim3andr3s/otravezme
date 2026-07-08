import { useState } from 'react';
import { Loader2, Image, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';

const emptyState = { url: '', caption: '' };

export function ManageGalleryImageForm({ onClose, onSave, image = null }) {
  const isEdit = Boolean(image);
  const [formData, setFormData] = useState(() => image ? { url: image.url, caption: image.caption || '' } : emptyState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onSave(formData);
      setMessage(isEdit ? '¡Imagen actualizada!' : '¡Imagen agregada!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Imagen' : 'Agregar Imagen'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input name="url" value={formData.url} onChange={handleChange} placeholder="URL de la imagen" required />
        <Input name="caption" value={formData.caption} onChange={handleChange} placeholder="Subtítulo (opcional)" />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Agregar Imagen'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}