import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';
import { useUploadGuard } from '../../hooks/useUploadGuard.js';

const emptyState = { url: '', caption: '' };

export function ManageGalleryImageForm({ onClose, onSave, image = null }) {
  const isEdit = Boolean(image);
  const [formData, setFormData] = useState(() => (image ? { url: image.url, caption: image.caption || '' } : emptyState));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isUploading, onUploadingChange } = useUploadGuard();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      setMessage('Espera a que termine de subir la foto antes de guardar.');
      return;
    }
    if (!formData.url) {
      setMessage('Error: falta la foto. Súbela o pega una URL.');
      return;
    }
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
        <FileUploadField
          label="Foto para la galería"
          kind="image"
          required
          url={formData.url}
          onUploaded={({ url }) => setFormData((prev) => ({ ...prev, url }))}
          onUploadingChange={onUploadingChange}
          helpText="Sube una foto de eventos, talleres o actividades de la biblioteca."
        />
        <Input name="caption" value={formData.caption} onChange={handleChange} placeholder="Subtítulo (opcional)" />
        <button
          type="submit"
          disabled={loading || isUploading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          {isUploading ? 'Esperando la foto...' : loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Agregar Imagen'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
