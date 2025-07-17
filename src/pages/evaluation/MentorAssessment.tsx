import { Minus } from 'lucide-react';
import { StarRating } from '../../components/StarRating';

interface MentorEvaluationProps {
  id: string;
  name: string;
  initials: string;
  rating: number;
  justification: string;
  onRatingChange: (rating: number) => void;
  onJustificationChange: (justification: string) => void;
  onMinimize: () => void;
  className?: string;
}

export const MentorEvaluation = ({
  id,
  name,
  initials,
  rating,
  justification,
  onRatingChange,
  onJustificationChange,
  onMinimize,
  className,
}: MentorEvaluationProps) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
      <div className='p-6'>
        {/* Header with mentor info and minimize action */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
              <span className='text-lg font-semibold text-blue-600'>{initials}</span>
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>{name}</h3>
              <p className='text-sm text-gray-600'>Mentor</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {rating > 0 && (
              <div className='px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'>{rating}</div>
            )}
            <button
              onClick={onMinimize}
              className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors'
              title='Minimizar'
            >
              <Minus className='h-4 w-4' />
            </button>
          </div>
        </div>

        {/* Rating section */}
        <div className='mb-6'>
          <p className='text-sm text-gray-700 mb-3'>Dê uma avaliação de 1 a 5 ao seu mentor</p>
          <StarRating rating={rating} onRatingChange={onRatingChange} size='lg' />
        </div>

        {/* Justification section */}
        <div className='space-y-2'>
          <label htmlFor={`justification-${id}`} className='text-sm font-medium text-gray-700 block'>
            Justifique sua nota
          </label>
          <textarea
            id={`justification-${id}`}
            placeholder='Justifique sua nota'
            value={justification}
            onChange={e => onJustificationChange(e.target.value)}
            className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
          />
        </div>
      </div>
    </div>
  );
};
