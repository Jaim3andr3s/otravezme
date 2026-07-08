import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 space-y-4">
      <Compass className="w-16 h-16 text-indigo-500 mx-auto" />
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Página no encontrada</h1>
      <p className="text-gray-600 dark:text-gray-400">Parece que te perdiste entre las estanterías.</p>
      <Link
        to="/"
        className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
