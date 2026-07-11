import { useState } from 'react';
import { Loader2, Rocket, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';
import { useUploadGuard } from '../../hooks/useUploadGuard.js';

const emptyState = { title: '', author: '', category: '', cover: '', description: '', ageRange: '', readOnlineUrl: '' };

export function PublishBookForm({ onClose, onPublish, book = null }) {
  const isEdit = Boolean(book);
  const [formData, setFormData] = useState(() => (book ? { ...emptyState, ...book, readOnlineUrl: book.readOnlineUrl || '' } : emptyState));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isUploading, onUploadingChange } = useUploadGuard();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      setMessage('Espera a que termine de subir la portada antes de guardar.');
      return;
    }
    if (!formData.cover) {
      setMessage('Error: falta la portada del libro. Sube una foto o pega una URL.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await onPublish(formData);
      setMessage(isEdit ? '¡Libro actualizado!' : '¡Libro añadido!');
      if (!isEdit) setFormData(emptyState);
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Libro' : 'Añadir Libro'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del Libro" required />
        <Input name="author" value={formData.author} onChange={handleChange} placeholder="Autor" required />
        <Input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría (Ej: Fantasía, Novela)" required />
        <Input name="ageRange" value={formData.ageRange} onChange={handleChange} placeholder="Rango de Edad (Ej: 10-14 años)" required />
        <FileUploadField
          label="Portada del libro"
          kind="image"
          required
          url={formData.cover}
          onUploaded={({ url }) => setFormData((prev) => ({ ...prev, cover: url }))}
          onUploadingChange={onUploadingChange}
          helpText="Sube una foto de la portada desde tu computador o celular."
        />
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
          disabled={loading || isUploading}
          className="w-full px-4 py-3 min-h-[44px] bg-success text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : isEdit ? (
            <Save className="mr-2 w-5 h-5" />
          ) : (
            <Rocket className="mr-2 w-5 h-5" />
          )}
          {isUploading ? 'Esperando la portada...' : loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Añadir libro'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}