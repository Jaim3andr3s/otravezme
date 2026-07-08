import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 space-y-4">
      <Compass className="w-16 h-16 text-accent mx-auto" />
      <h1 className="text-4xl font-serif font-semibold text-ink">Página no encontrada</h1>
      <p className="text-ink-muted">Parece que te perdiste entre las estanterías.</p>
      <Link
        to="/"
        className="inline-block mt-4 px-6 py-3 bg-accent text-accent-ink font-semibold rounded-full shadow-sm hover:bg-accent-hover transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
