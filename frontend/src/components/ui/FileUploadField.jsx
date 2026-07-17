import { useRef, useState } from 'react';
import { UploadCloud, Loader2, FileText, ImageIcon, X, Link2, CheckCircle2 } from 'lucide-react';
import { uploadFile, resolveFileUrl } from '../../services/api.js';

// Campo de subida de archivos reutilizable para todos los formularios de
// admin. Pensado para gente sin experiencia técnica: un botón grande para
// "Subir desde el computador" (fotos, PDF o Word) y, si lo prefieren, una
// alternativa para pegar una URL externa. Nunca obliga a saber qué es una URL.
//
// Props:
// - label: texto del campo (ej. "Foto de portada")
// - kind: 'image' | 'document' | 'any' — determina el accept y el ícono
// - url / name: valor actual (url guardada, y nombre de archivo si aplica)
// - onUploaded({ url, name }) — se llama cuando el archivo terminó de subirse
//   o cuando se limpia el campo (url: '', name: '')
// - helpText: texto de ayuda opcional bajo el campo
// - required: si es obligatorio (solo visual, la validación real la hace el form)
const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  document: 'application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  any: 'image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function isImageUrl(url = '') {
  return /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url);
}

export function FileUploadField({ label, kind = 'any', url = '', name = '', onUploaded, helpText, required = false, onUploadingChange }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('subir'); // 'subir' | 'url'
  const [uploading, setUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    onUploadingChange?.(true);
    setProgressMsg(`Subiendo "${file.name}"...`);
    try {
      const result = await uploadFile(file);
      onUploaded({ url: result.url, name: result.originalName });
      setProgressMsg('');
    } catch (err) {
      setError(err.message || 'No se pudo subir el archivo. Intenta con otro archivo.');
      setProgressMsg('');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onUploaded({ url: '', name: '' });
    setError('');
  };

  const showPreviewImage = kind !== 'document' && url && (isImageUrl(url) || mode === 'subir');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-ink flex items-center gap-1">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">*</span>
          ) : (
            <span className="text-ink-muted font-normal text-xs">(opcional)</span>
          )}
        </label>
        <div className="flex text-xs rounded-full bg-surface-alt border border-edge overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('subir')}
            className={`px-3 py-1 transition ${mode === 'subir' ? 'bg-accent text-accent-ink' : 'text-ink-muted'}`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 transition flex items-center gap-1 ${mode === 'url' ? 'bg-accent text-accent-ink' : 'text-ink-muted'}`}
          >
            <Link2 className="w-3 h-3" /> Pegar URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={url}
          onChange={(e) => onUploaded({ url: e.target.value, name: '' })}
          placeholder="https://..."
          className="w-full p-3 border border-edge rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent bg-surface text-ink transition duration-150"
        />
      ) : (
        <div className="border-2 border-dashed border-edge rounded-lg p-4 bg-surface-alt/50">
          {!url && !uploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-4 text-ink-muted hover:text-accent transition"
            >
              <UploadCloud className="w-8 h-8" />
              <span className="text-sm font-medium">
                {kind === 'image' ? 'Toca para elegir una foto' : kind === 'document' ? 'Toca para elegir un PDF o Word' : 'Toca para elegir una foto, PDF o Word'}
              </span>
              <span className="text-xs">Máx. 15 MB</span>
            </button>
          )}

          {uploading && (
            <div className="flex items-center justify-center gap-2 py-4 text-accent text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> {progressMsg}
            </div>
          )}

          {!uploading && url && (
            <div className="flex items-center gap-3">
              {showPreviewImage ? (
                <img src={resolveFileUrl(url)} alt="Vista previa" className="w-16 h-16 object-cover rounded-lg border border-edge" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-edge bg-surface text-accent">
                  <FileText className="w-7 h-7" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="truncate">{name || 'Archivo cargado'}</span>
                </p>
                <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-accent hover:underline">
                  Cambiar archivo
                </button>
              </div>
              <button type="button" onClick={handleClear} className="p-1.5 text-ink-muted hover:text-danger transition" title="Quitar">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept={ACCEPT[kind]} onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
      {helpText && !error && <p className="text-xs text-ink-muted">{helpText}</p>}
    </div>
  );
}

export function FieldIcon({ kind }) {
  return kind === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
}
