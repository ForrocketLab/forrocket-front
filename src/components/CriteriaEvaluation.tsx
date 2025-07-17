import { StarRating } from './StarRating';

interface CriteriaEvaluationProps {
  id: string;
  title: string;
  description?: string;
  rating: number;
  justification: string;
  onRatingChange: (rating: number) => void;
  onJustificationChange: (justification: string) => void;
  className?: string;
  isReadOnly?: boolean;
}

export const CriteriaEvaluation = ({
  id,
  title,
  description,
  rating,
  justification,
  onRatingChange,
  onJustificationChange,
  className,
  isReadOnly = false,
}: CriteriaEvaluationProps) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg border-l-4 border-l-[#08605F]/20 shadow-sm ${className || ''}`}
    >
      <div className='p-4'>
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <h4 className='font-medium text-gray-900'>{title}</h4>
              {description && <p className='text-sm text-gray-600 mt-1'>{description}</p>}
            </div>
            <div className='flex items-center gap-3'>
              <StarRating rating={rating} onRatingChange={onRatingChange} size='md' disabled={isReadOnly} />
              <span className='text-sm font-medium textbg-[#08605F] min-w-[2rem]'>
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* Justification */}
          <div className='space-y-2'>
            <label htmlFor={`justification-${id}`} className='text-sm font-medium text-gray-700 block'>
              Justifique sua nota
            </label>
            <textarea
              id={`justification-${id}`}
              placeholder='Descreva os motivos que justificam sua avaliação...'
              value={justification}
              onChange={e => onJustificationChange(e.target.value)}
              disabled={isReadOnly}
              className={`w-full min-h-[80px] resize-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#08605F] focus:border-[#08605F] outline-none ${
                isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Auto-evaluation guidance */}
          {rating > 0 && (
            <div className='text-xs text-gray-600 bg-[#08605F]/10 p-2 rounded'>
              💡 Sua avaliação de 1 a 5 com base no critério
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
