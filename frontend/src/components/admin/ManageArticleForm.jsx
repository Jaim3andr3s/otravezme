import { useState } from 'react';
import { Loader2, Newspaper, Save } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';
import { RichTextEditor } from '../ui/RichTextEditor.jsx';
import { useUploadGuard } from '../../hooks/useUploadGuard.js';

const emptyState = {
  publication: '',
  section: '',
  edition: '',
  title: '',
  author: '',
  content: '',
  coverImage: '',
  attachmentUrl: '',
  attachmentName: '',
};

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
  const { isUploading, onUploadingChange } = useUploadGuard();

  const sections = SECTIONS[formData.publication] || [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      setMessage('Espera a que terminen de subir los archivos antes de guardar.');
      return;
    }
    const plainContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!plainContent) {
      setMessage('Error: escribe el contenido del artículo antes de guardarlo.');
      return;
    }
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
        <p className="text-xs text-ink-muted bg-accent-soft text-accent rounded-lg px-3 py-2">
          💡 Consejo: escribe el contenido del artículo aquí abajo, y si quieres puedes subir una foto de portada y/o un archivo (PDF o Word) con la versión completa para que los lectores lo descarguen.
        </p>

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
        <div>
          <label className="text-sm font-semibold text-ink block mb-1">Contenido del artículo</label>
          <RichTextEditor
            value={formData.content}
            onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            placeholder="Escribe el artículo aquí. Usa la barra de arriba para poner negritas, títulos, listas..."
          />
        </div>

        <FileUploadField
          label="Foto de portada"
          kind="image"
          url={formData.coverImage}
          name=""
          onUploaded={({ url }) => setFormData((prev) => ({ ...prev, coverImage: url }))}
          onUploadingChange={onUploadingChange}
          helpText="Aparece como imagen destacada en la tarjeta del artículo (opcional)."
        />

        <FileUploadField
          label="Archivo adjunto (PDF o Word)"
          kind="document"
          url={formData.attachmentUrl}
          name={formData.attachmentName}
          onUploaded={({ url, name }) =>
            setFormData((prev) => ({ ...prev, attachmentUrl: url, attachmentName: name || prev.attachmentName }))
          }
          onUploadingChange={onUploadingChange}
          helpText="Súbelo si el artículo completo está en un documento (opcional)."
        />

        <button
          type="submit"
          disabled={loading || isUploading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          {isUploading ? 'Esperando archivos...' : loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Artículo'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
