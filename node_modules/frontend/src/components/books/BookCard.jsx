import { motion } from 'framer-motion';
import { Heart, Sparkles, Check, XOctagon, Pencil, Trash2, Star } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { StarRating } from './StarRating.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { BOOK_STATUS_LABEL } from '../../constants/labels.js';

export function BookCard({ book, onClick, onEdit, onDelete, onSetBookOfMonth, isAdmin }) {
  const { isFavorite } = useProfile();
  const favorite = isFavorite(book.id);
  const isBookOfMonth = book.isBookOfMonth === true;

  return (
    <motion.div
      className="flex flex-col h-full bg-surface border border-edge rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 relative"
      onClick={() => onClick(book)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      layout
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="p-1.5 rounded-full bg-gold-soft text-gold hover:opacity-80 transition shadow-md"
            title="Editar libro"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book.id);
            }}
            className="p-1.5 rounded-full bg-danger-soft text-danger hover:opacity-80 transition shadow-md"
            title="Eliminar libro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetBookOfMonth(book.id);
            }}
            className={`p-1.5 rounded-full shadow-md transition ${isBookOfMonth ? 'bg-gold text-white' : 'bg-gold-soft text-gold hover:opacity-80'}`}
            title={isBookOfMonth ? 'Libro del mes' : 'Marcar como libro del mes'}
          >
            <Star className={`w-4 h-4 ${isBookOfMonth ? 'fill-white' : ''}`} />
          </button>
        </div>
      )}

      <div className="relative overflow-hidden w-full h-56 flex-shrink-0">
        <img
          src={book.cover}
          alt={`Portada de ${book.title}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/360x560/E2E8F0/1F2937?text=Sin+Portada';
          }}
        />
        {favorite && (
          <motion.div
            className="absolute top-2 left-2 p-1.5 bg-danger rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Heart className="w-4 h-4 text-white fill-white" />
          </motion.div>
        )}
        {isBookOfMonth && (
          <div className="absolute top-2 left-2">
            <Badge icon={Star} text="📖 Libro del Mes" color="bg-gold" textColor="text-accent-ink" />
          </div>
        )}
        {book.isStaffPick && !isBookOfMonth && (
          <div className="absolute top-2 left-2">
            <Badge icon={Sparkles} text="Selección Staff" color="bg-gold" textColor="text-accent-ink" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-semibold text-ink mb-1 leading-tight">{book.title}</h3>
        <p className="text-sm text-accent font-medium mb-3">{book.author}</p>
        <div className="mt-auto">
          <StarRating rating={book.rating} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={book.category} color="bg-surface-alt" textColor="text-ink-muted" />
            <Badge text={book.ageRange} color="bg-surface-alt" textColor="text-ink-muted" />
            <Badge
              icon={book.status === 'DISPONIBLE' ? Check : XOctagon}
              text={BOOK_STATUS_LABEL[book.status] ?? book.status}
              color={book.status === 'DISPONIBLE' ? 'bg-success-soft' : 'bg-danger-soft'}
              textColor={book.status === 'DISPONIBLE' ? 'text-success' : 'text-danger'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}