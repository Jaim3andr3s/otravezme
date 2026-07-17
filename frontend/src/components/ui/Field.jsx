// Envuelve un campo de formulario con una etiqueta que deja claro si es
// obligatorio (asterisco rojo) u opcional (texto "opcional"), para que el
// usuario nunca tenga que adivinarlo.
export function Field({ label, required = false, hint, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink flex items-center gap-1 mb-1">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">*</span>
        ) : (
          <span className="text-ink-muted font-normal text-xs">(opcional)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}
