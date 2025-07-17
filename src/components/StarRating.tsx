import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const StarRating = ({ rating, onRatingChange, size = 'md', className, disabled = false }: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex gap-1 ${className || ''}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type='button'
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating ? 'fill-[#08605F] text-[#08605F]/70' : 'fill-none text-gray-300 hover:text-[#08605F]/70'
            } ${disabled ? 'opacity-50' : 'hover:cursor-pointer'}`}
          />
        </button>
      ))}
    </div>
  );
};
