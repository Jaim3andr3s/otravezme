import { useState } from 'react';
import { Loader2, Newspaper, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';

const emptyState = { publication: '', section: '', edition: '', title: '', author: '', content: '', coverImage: '' };

const SECTIONS = {
  PERIODICO: ['Editorial', 'Informativa', 'Literatura', 'Opinión', 'Entretenimiento'],
  REVISTA: ['Editorial', 'Autor destacado', 'Ficha de lectura', 'Producciones literarias', 'Pasatiempos literarios'],
};

export function ManageArticleForm({ onClose, onSave, article = null, fixedType = null }) {
  const isEdit = Boolean(article);
  const initialType = fixedType || article?.publication || 'PERIODICO';
  const [formData, setFormData] = useState(() => {
    if (article) return { ...emptyState, ...article };
    return { ...emptyState, publication: initialType };
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sections = SECTIONS[formData.publication] || [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await onSave(formData);
      setMessage(isEdit ? '¡Artículo actualizado!' : '¡Artículo creado!');
      if (!isEdit) setFormData({ ...emptyState, publication: initialType });
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar Artículo' : 'Nuevo Artículo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {!fixedType && (
          <Input as="select" name="publication" value={formData.publication} onChange={handleChange} required>
            <option value="PERIODICO">Periódico</option>
            <option value="REVISTA">Revista Digital</option>
          </Input>
        )}
        <Input as="select" name="section" value={formData.section} onChange={handleChange} required>
          <option value="">Seleccionar sección</option>
          {sections.map((s) => <option key={s} value={s}>{s}</option>)}
        </Input>
        <Input name="edition" value={formData.edition} onChange={handleChange} placeholder="Edición (ej. 2026-07)" />
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título del artículo" required />
        <Input name="author" value={formData.author} onChange={handleChange} placeholder="Autor" required />
        <Input as="textarea" name="content" value={formData.content} onChange={handleChange} placeholder="Contenido" required className="h-24" />
        <Input name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="URL de imagen de portada (opcional)" />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Artículo'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}