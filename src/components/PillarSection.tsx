import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CriteriaEvaluation } from './CriteriaEvaluation';

export interface Criteria {
  id: string;
  title: string;
  description?: string;
  rating: number;
  justification: string;
}

interface PillarSectionProps {
  id: string;
  title: string;
  description?: string;
  criteria: Criteria[];
  onCriteriaUpdate: (criteriaId: string, updates: Partial<Criteria>) => void;
  defaultOpen?: boolean;
  className?: string;
}

export const PillarSection = ({
  title,
  description,
  criteria,
  onCriteriaUpdate,
  defaultOpen = false,
  className,
}: PillarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCriteria = criteria.filter(c => c.rating > 0).length;
  const averageRating = criteria.length > 0 ? criteria.reduce((sum, c) => sum + c.rating, 0) / criteria.length : 0;

  const progressPercentage = criteria.length > 0 ? (completedCriteria / criteria.length) * 100 : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
      <div onClick={() => setIsOpen(!isOpen)} className='cursor-pointer hover:bg-gray-50 transition-colors p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {isOpen ? (
              <ChevronDown className='h-5 w-5 text-gray-500' />
            ) : (
              <ChevronRight className='h-5 w-5 text-gray-500' />
            )}
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
              {description && <p className='text-sm text-gray-600 mt-1'>{description}</p>}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div className='text-2xl font-bold text-[#08605F]'>
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </div>
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                {completedCriteria}/{criteria.length} preenchidos
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className='mt-3'>
          <div className='flex justify-between text-xs text-gray-600 mb-1'>
            <span>Progresso</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-[#08605F]/70 h-2 rounded-full transition-all duration-300'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='px-4 pb-4 space-y-4'>
          {criteria.map(criterion => (
            <CriteriaEvaluation
              key={criterion.id}
              id={criterion.id}
              title={criterion.title}
              description={criterion.description}
              rating={criterion.rating}
              justification={criterion.justification}
              onRatingChange={rating => onCriteriaUpdate(criterion.id, { rating })}
              onJustificationChange={justification => onCriteriaUpdate(criterion.id, { justification })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
