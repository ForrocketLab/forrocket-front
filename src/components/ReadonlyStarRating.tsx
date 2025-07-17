import { Star } from 'lucide-react';

interface ReadonlyStarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReadonlyStarRating = ({ rating, size = 'md', className }: ReadonlyStarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex gap-1 ${className || ''}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'fill-[#08605F] text-[#08605F]/70' : 'fill-none text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};
