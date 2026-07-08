import { BookOpenCheck, Heart, Eraser, Check, ThumbsUp, ThumbsDown, Trash2, Pencil, Badge as BadgeIcon, Landmark, Star, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { BOOK_STATUS_LABEL } from '../../constants/labels.js';

export function BookModal({ book, onClose, onVote, onDelete, onEdit }) {
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
            <h3 className="text-3xl font-serif font-semibold text-ink mb-2">{book.title}</h3>
            <p className="text-xl text-accent font-medium mb-3">{book.author}</p>

            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <BadgeIcon className="w-5 h-5 text-ink-muted" />
                <span className="bg-surface-alt px-3 py-1 rounded-full text-xs font-medium text-ink-muted">
                  {book.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-ink-muted" />
                <span className="bg-surface-alt px-3 py-1 rounded-full text-xs font-medium text-ink-muted">
                  {book.ageRange}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-gold" />
                <span className="font-semibold text-ink">{book.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-ink-muted" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    book.status === 'DISPONIBLE' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                  }`}
                >
                  {BOOK_STATUS_LABEL[book.status] ?? book.status}
                </span>
              </div>
            </div>

            <p className="text-ink-muted mb-4">{book.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={book.readOnlineUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} bg-success hover:opacity-90 ${!book.readOnlineUrl ? 'opacity-50 cursor-not-allowed' : ''} flex-grow`}
            onClick={(e) => {
              if (!book.readOnlineUrl) e.preventDefault();
            }}
          >
            <BookOpenCheck className="w-5 h-5 mr-2" />
            {book.readOnlineUrl ? 'Leer en Línea' : 'Préstamo Físico'}
          </a>
          <button
            onClick={() => toggleFavorite(book.id)}
            className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${favorite ? 'bg-danger hover:opacity-90' : 'bg-surface-alt !text-ink hover:opacity-80'}`}
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={() => toggleRead(book.id)}
            className={`${buttonClass} flex-shrink-0 w-full sm:w-auto ${read ? 'bg-accent-hover' : 'bg-accent'} hover:opacity-90`}
            title={read ? 'Marcar como No Leído' : 'Marcar como Leído'}
          >
            {read ? <Eraser className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(book)}
                className={`${buttonClass} flex-shrink-0 w-full sm:w-auto bg-gold hover:opacity-90`}
                title="Editar Libro (Admin)"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(book.id)}
                className={`${buttonClass} flex-shrink-0 w-full sm:w-auto bg-danger hover:opacity-90`}
                title="Eliminar Libro (Admin)"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-edge">
          <h4 className="text-lg font-serif font-semibold text-ink mb-2">¿Te gustó el libro?</h4>
          <div className="flex items-center space-x-4">
            <IconButton icon={ThumbsUp} onClick={() => onVote(book.id, 'up')} className="bg-success text-white hover:opacity-90" title="Votar Positivo" />
            <IconButton icon={ThumbsDown} onClick={() => onVote(book.id, 'down')} className="bg-danger text-white hover:opacity-90" title="Votar Negativo" />
            <span className="text-sm text-ink-muted">Ayuda a otros lectores a descubrir.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
