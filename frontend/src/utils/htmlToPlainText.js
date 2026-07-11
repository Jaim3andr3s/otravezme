// Convierte el HTML que guarda el editor tipo Word en texto plano, para
// usarlo en resúmenes/tarjetas (line-clamp) donde no queremos renderizar
// etiquetas ni perder el layout con markup roto a mitad de una línea.
export function htmlToPlainText(html = '') {
  if (!html) return '';
  if (typeof window === 'undefined' || !window.DOMParser) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
