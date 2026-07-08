import { BookOpenCheck, Heart, Eraser, Check, ThumbsUp, ThumbsDown, Trash2, Badge as BadgeIcon, Landmark, Star, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { BOOK_STATUS_LABEL } from '../../constants/labels.js';

export function BookModal({ book, onClose, onVote, onDelete }) {
  const { isFavorite, isRead, toggleFavorite, toggleRead } = useProfile();
  const { isAdmin } = useAuth();
  const favorite = isFavorite(book.id);
  const read = isRead(book.id);
  const buttonClass =
    'px-4 py-2 rounded-full font-semibold text-white transition-colors duration-200 shadow-md flex items-center justify-center';

  return (
    <Modal title={book.title} onClose={onClose}>
      <div className="p-6 space-y-4 text-left">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={book.cover}
            alt={`Portada de ${book.title}`}
            className="w-40 h-56 object-cover rounded-lg shadow-lg flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/160x224/AEC6CF/FFFFFF?text=Portada+No+Disponible';
            }}
          />
          <div className="flex-grow">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{book.title}</h3>
            <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{book.author}</p>

            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <BadgeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="bg-indigo-100 dark:bg-indigo-700/50 px-3 py-1 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {book.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="bg-teal-100 dark:bg-teal-700/50 px-3 py-1 rounded-full text-xs font-medium text-teal-600 dark:text-teal-300">
                  {book.ageRange}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-700 dark:text-gray-200">{book.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    book.status === 'DISPONIBLE'
                      ? 'bg-emerald-100 dark:bg-emerald-700/50 text-emerald-600 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-700/50 text-red-600 dark:text-red-300'
                  }`}
                >
                  {BOOK_STATUS_LABEL[book.status] ?? book.status}
                </span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{book.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={book.readOnlineUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700 ${!book.readOnlineUrl ? 'opacity-50 cursor-not-allowed' : ''} flex-grow`}
            onClick={(e) => {
              if (!book.readOnlineUrl) e.preventDefault();
            }}
          >
            <BookOpenCheck className="w-5 h-5 mr-2" />
            {book.readOnlineUrl ? 'Leer en Línea' : 'Préstamo Físico'}
          </a>
          <button
            onClick={() => toggleFavorite(book.id)}
            className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${favorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={() => toggleRead(book.id)}
            className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${read ? 'bg-sky-500 hover:bg-sky-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            title={read ? 'Marcar como No Leído' : 'Marcar como Leído'}
          >
            {read ? <Eraser className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(book.id)}
              className={`${buttonClass} flex-shrink-0 w-full sm:w-auto bg-red-600 hover:bg-red-700`}
              title="Eliminar Libro (Admin)"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Te gustó el libro?</h4>
          <div className="flex items-center space-x-4">
            <IconButton icon={ThumbsUp} onClick={() => onVote(book.id, 'up')} className="bg-emerald-500 text-white hover:bg-emerald-600" title="Votar Positivo" />
            <IconButton icon={ThumbsDown} onClick={() => onVote(book.id, 'down')} className="bg-red-500 text-white hover:bg-red-600" title="Votar Negativo" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Ayuda a otros lectores a descubrir.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
