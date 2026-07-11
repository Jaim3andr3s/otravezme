import { useState } from 'react';
import { Loader2, NotebookText, Save, BookOpen } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { FileUploadField } from '../ui/FileUploadField.jsx';
import { useBooks } from '../../context/BooksContext.jsx';
import { useUploadGuard } from '../../hooks/useUploadGuard.js';

const emptyState = { title: '', description: '', level: '', durationWeeks: '', documentUrl: '' };

// Convierte la lista plana de { bookId, week, note } que espera el backend
// en un mapa por bookId, más fácil de editar desde checkboxes.
function booksArrayToMap(books = []) {
  const map = {};
  for (const b of books) {
    map[b.bookId] = { checked: true, week: String(b.week), note: b.note || '' };
  }
  return map;
}

export function PublishPlanForm({ onClose, onPublish, plan = null }) {
  const isEdit = Boolean(plan);
  const { books, loading: loadingBooks } = useBooks();

  const [formData, setFormData] = useState(() =>
    plan
      ? {
          title: plan.title,
          description: plan.description,
          level: plan.level,
          durationWeeks: String(plan.durationWeeks),
          documentUrl: plan.documentUrl || '',
        }
      : emptyState
  );
  const [bookSelection, setBookSelection] = useState(() => (plan ? booksArrayToMap(plan.books) : {}));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isUploading, onUploadingChange } = useUploadGuard();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleBook = (bookId) => {
    setBookSelection((prev) => {
      const current = prev[bookId];
      if (current?.checked) {
        const { [bookId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [bookId]: { checked: true, week: '1', note: '' } };
    });
  };

  const updateBookField = (bookId, field, value) => {
    setBookSelection((prev) => ({ ...prev, [bookId]: { ...prev[bookId], [field]: value } }));
  };

  const selectedCount = Object.keys(bookSelection).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isUploading) {
      setMessage('Espera a que termine de subir el documento antes de guardar.');
      return;
    }

    const booksArray = Object.entries(bookSelection).map(([bookId, v]) => ({
      bookId: Number(bookId),
      week: parseInt(v.week, 10) || 1,
      note: v.note || undefined,
    }));

    if (booksArray.length === 0) {
      setMessage('Error: elige al menos un libro para el plan lector.');
      return;
    }
    if (booksArray.some((b) => !b.week || b.week < 1)) {
      setMessage('Error: revisa que cada libro tenga un número de semana válido.');
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
      if (!isEdit) {
        setFormData(emptyState);
        setBookSelection({});
      }
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
        <p className="text-xs text-ink-muted bg-accent-soft text-accent rounded-lg px-3 py-2">
          💡 Marca los libros que hacen parte del plan y dinos en qué semana se leen. Puedes agregar más libros luego editando el plan.
        </p>
        <p className="text-xs text-ink-muted">* Campos obligatorios.</p>
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="* Título del Plan (Ej: Novelas para el Verano)" required />
        <Input name="level" value={formData.level} onChange={handleChange} placeholder="* Nivel (Ej: Básico, Intermedio, Adultos)" required />
        <Input type="number" name="durationWeeks" value={formData.durationWeeks} onChange={handleChange} placeholder="* Duración (Semanas)" required min="1" />
        <Input as="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="* Descripción breve del Plan" required className="h-16" />

        <FileUploadField
          label="Documento del plan (PDF o Word, opcional)"
          kind="document"
          url={formData.documentUrl}
          onUploaded={({ url }) => setFormData((prev) => ({ ...prev, documentUrl: url }))}
          onUploadingChange={onUploadingChange}
          helpText="Súbelo si tienes una guía en PDF o Word para acompañar el plan."
        />

        <div>
          <label className="text-sm font-semibold text-ink flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" /> Libros del plan {selectedCount > 0 && <span className="text-accent">({selectedCount} elegidos)</span>}
          </label>
          {loadingBooks ? (
            <div className="flex items-center gap-2 text-sm text-ink-muted py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando catálogo...
            </div>
          ) : books.length === 0 ? (
            <p className="text-sm text-ink-muted">Aún no hay libros en la biblioteca. Añade libros primero desde el panel de admin.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 border border-edge rounded-lg p-2">
              {books.map((book) => {
                const sel = bookSelection[book.id];
                return (
                  <div key={book.id} className={`p-2 rounded-lg border ${sel ? 'border-accent bg-accent-soft/40' : 'border-edge'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={Boolean(sel)} onChange={() => toggleBook(book.id)} className="w-4 h-4 accent-current" />
                      <span className="text-sm font-medium text-ink">{book.title}</span>
                      <span className="text-xs text-ink-muted">— {book.author}</span>
                    </label>
                    {sel && (
                      <div className="flex gap-2 mt-2 pl-6">
                        <input
                          type="number"
                          min="1"
                          value={sel.week}
                          onChange={(e) => updateBookField(book.id, 'week', e.target.value)}
                          placeholder="Semana"
                          className="w-20 p-1.5 text-sm border border-edge rounded bg-surface text-ink"
                        />
                        <input
                          type="text"
                          value={sel.note}
                          onChange={(e) => updateBookField(book.id, 'note', e.target.value)}
                          placeholder="Nota para esta semana (opcional)"
                          className="flex-1 p-1.5 text-sm border border-edge rounded bg-surface text-ink"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || isUploading}
          className="w-full px-4 py-2 bg-accent text-accent-ink font-semibold rounded-lg shadow-sm hover:bg-accent-hover transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : isEdit ? (
            <Save className="mr-2 w-5 h-5" />
          ) : (
            <NotebookText className="mr-2 w-5 h-5" />
          )}
          {isUploading ? 'Esperando el documento...' : loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Publicar Plan'}
        </button>
        {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
    </Modal>
  );
}
