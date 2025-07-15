import { Trash2 } from 'lucide-react';

interface ReferenceEvaluationProps {
  id: string;
  name: string;
  role: string;
  initials: string;
  justification: string;
  onJustificationChange: (justification: string) => void;
  onRemove: () => void;
  className?: string;
}

export const ReferenceEvaluation = ({
  id,
  name,
  role,
  initials,
  justification,
  onJustificationChange,
  onRemove,
  className,
}: ReferenceEvaluationProps) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
      <div className='p-6'>
        {/* Header with person info and remove action */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
              <span className='text-lg font-semibold text-blue-600'>{initials}</span>
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>{name}</h3>
              <p className='text-sm text-gray-600'>{role}</p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
            title='Remover'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>

        {/* Justification section */}
        <div className='space-y-2'>
          <label htmlFor={`justification-${id}`} className='text-sm font-medium text-gray-700 block'>
            Justifique sua escolha
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
