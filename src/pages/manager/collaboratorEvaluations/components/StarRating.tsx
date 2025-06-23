import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({ rating, size = 24, disabled = false, onRatingChange }: StarRatingProps) => {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map(starValue => {
        const isHalf = rating >= starValue - 0.5 && rating < starValue;
        const isFull = rating >= starValue;

        return (
          <div
            key={starValue}
            onClick={() => !disabled && onRatingChange?.(starValue)}
            className={`transition-colors ${!disabled ? 'cursor-pointer hover:text-teal-500' : 'cursor-default'}`}
          >
            {isFull ? (
              <Star size={size} className='text-teal-500' fill='currentColor' />
            ) : isHalf ? (
              <StarHalf size={size} className='text-teal-500' fill='currentColor' />
            ) : (
              <Star size={size} className='text-gray-300' />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
