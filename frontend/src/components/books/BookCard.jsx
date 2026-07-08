import { motion } from 'framer-motion';
import { Heart, Sparkles, Check, XOctagon } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { StarRating } from './StarRating.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { BOOK_STATUS_LABEL } from '../../constants/labels.js';

export function BookCard({ book, onClick }) {
  const { isFavorite } = useProfile();
  const favorite = isFavorite(book.id);

  return (
    <motion.div
      className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02]"
      onClick={() => onClick(book)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      layout
    >
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
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Heart className="w-4 h-4 text-white fill-white" />
          </motion.div>
        )}
        {book.isStaffPick && (
          <div className="absolute top-2 left-2">
            <Badge icon={Sparkles} text="Selección Staff" color="bg-yellow-400/90" textColor="text-yellow-900" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">{book.title}</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3">{book.author}</p>
        <div className="mt-auto">
          <StarRating rating={book.rating} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={book.category} color="bg-indigo-100 dark:bg-indigo-700/50" textColor="text-indigo-600 dark:text-indigo-300" />
            <Badge text={book.ageRange} color="bg-teal-100 dark:bg-teal-700/50" textColor="text-teal-600 dark:text-teal-300" />
            <Badge
              icon={book.status === 'DISPONIBLE' ? Check : XOctagon}
              text={BOOK_STATUS_LABEL[book.status] ?? book.status}
              color={book.status === 'DISPONIBLE' ? 'bg-emerald-100 dark:bg-emerald-700/50' : 'bg-red-100 dark:bg-red-700/50'}
              textColor={book.status === 'DISPONIBLE' ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
