import { Star, StarHalf } from 'lucide-react';

export function StarRating({ rating, reviews }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-gold fill-gold" />
      ))}
      {hasHalfStar && <StarHalf className="w-4 h-4 text-gold fill-gold" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-edge" />
      ))}
      {reviews !== undefined && (
        <span className="ml-2 text-sm text-ink-muted">({reviews} opiniones)</span>
      )}
    </div>
  );
}
