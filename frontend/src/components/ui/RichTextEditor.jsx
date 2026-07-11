import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Quote, Link2, Eraser } from 'lucide-react';

// Editor de texto "tipo Word" para redactar artículos de periódico/revista:
// una barra de herramientas sencilla (negrita, cursiva, listas, títulos...)
// sobre un área editable que guarda HTML. Se usa document.execCommand a
// propósito en lugar de una librería externa (Quill/TipTap, etc.) porque
// esas librerías todavía no son totalmente compatibles con React 19; esto
// evita romper el build por una dependencia desactualizada.
function ToolbarButton({ icon: Icon, onClick, title }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // evita perder la selección de texto al hacer click
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-surface text-ink-muted hover:text-accent transition"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder = 'Escribe el contenido aquí...' }) {
  const ref = useRef(null);

  // Solo sincronizamos el HTML "desde afuera" (por ejemplo al abrir el
  // formulario en modo edición). Mientras el usuario escribe no tocamos el
  // innerHTML para no mover el cursor.
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emitChange();
  };

  const handleLink = () => {
    const url = window.prompt('Pega el enlace (https://...)');
    if (url) exec('createLink', url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-surface-alt border border-edge border-b-0 rounded-t-lg">
        <ToolbarButton icon={Bold} onClick={() => exec('bold')} title="Negrita" />
        <ToolbarButton icon={Italic} onClick={() => exec('italic')} title="Cursiva" />
        <ToolbarButton icon={Underline} onClick={() => exec('underline')} title="Subrayado" />
        <span className="w-px h-5 bg-edge mx-1" />
        <ToolbarButton icon={Heading2} onClick={() => exec('formatBlock', 'H2')} title="Título" />
        <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} title="Lista con viñetas" />
        <ToolbarButton icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Lista numerada" />
        <ToolbarButton icon={Quote} onClick={() => exec('formatBlock', 'BLOCKQUOTE')} title="Cita" />
        <span className="w-px h-5 bg-edge mx-1" />
        <ToolbarButton icon={Link2} onClick={handleLink} title="Insertar enlace" />
        <ToolbarButton icon={Eraser} onClick={() => exec('removeFormat')} title="Quitar formato" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none p-3 min-h-[160px] max-h-[420px] overflow-y-auto border border-edge rounded-b-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent [&_*]:text-ink empty:before:content-[attr(data-placeholder)] empty:before:text-ink-muted empty:before:pointer-events-none"
      />
    </div>
  );
}
