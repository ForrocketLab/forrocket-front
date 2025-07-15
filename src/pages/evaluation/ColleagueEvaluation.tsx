import { StarRating } from '../../components/StarRating';
import { WorkAgainMotivation } from '../../services/EvaluationService';

interface ColleagueEvaluationProps {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  strengths: string;
  improvements: string;
  workAgainMotivation: WorkAgainMotivation;
  onRatingChange: (rating: number) => void;
  onStrengthsChange: (strengths: string) => void;
  onImprovementsChange: (improvements: string) => void;
  onWorkAgainMotivationChange: (motivation: WorkAgainMotivation) => void;
  className?: string;
}

export const ColleagueEvaluation = ({
  id,
  name,
  role,
  initials,
  rating,
  strengths,
  improvements,
  workAgainMotivation,
  onRatingChange,
  onStrengthsChange,
  onImprovementsChange,
  onWorkAgainMotivationChange,
  className,
}: ColleagueEvaluationProps) => {
  const workAgainMotivationOptions = [
    { value: WorkAgainMotivation.STRONGLY_DISAGREE, label: 'Discordo Totalmente' },
    { value: WorkAgainMotivation.PARTIALLY_DISAGREE, label: 'Discordo Parcialmente' },
    { value: WorkAgainMotivation.NEUTRAL, label: 'Neutro' },
    { value: WorkAgainMotivation.PARTIALLY_AGREE, label: 'Concordo Parcialmente' },
    { value: WorkAgainMotivation.STRONGLY_AGREE, label: 'Concordo Totalmente' },
  ];
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
      <div className='p-6'>
        {/* Header with colleague info */}
        <div className='flex items-center mb-6'>
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
              <span className='text-lg font-semibold text-green-600'>{initials}</span>
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>{name}</h3>
              <p className='text-sm text-gray-600'>{role}</p>
            </div>
          </div>
        </div>

        {/* Rating section */}
        <div className='mb-6'>
          <p className='text-sm text-gray-700 mb-3'>Dê uma avaliação de 1 a 5 ao colaborador</p>
          <div className='flex flex-col lg:flex-row items-start lg:items-center gap-4'>
            <div className='flex items-center gap-2'>
              <StarRating rating={rating} onRatingChange={onRatingChange} size='lg' />
            </div>
            <div className='w-full lg:w-96'>
              <label htmlFor={`work-again-${id}`} className='text-sm font-medium text-gray-700 block mb-2'>
                Trabalharia novamente com este colaborador?
              </label>
              <select
                id={`work-again-${id}`}
                value={workAgainMotivation}
                onChange={e => onWorkAgainMotivationChange(e.target.value as WorkAgainMotivation)}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
              >
                <option value=''>Selecione uma opção</option>
                {workAgainMotivationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feedback sections */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label htmlFor={`strengths-${id}`} className='text-sm font-medium text-gray-700 block'>
              Pontos fortes
            </label>
            <textarea
              id={`strengths-${id}`}
              placeholder='Justifique sua nota'
              value={strengths}
              onChange={e => onStrengthsChange(e.target.value)}
              className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor={`improvements-${id}`} className='text-sm font-medium text-gray-700 block'>
              Pontos de melhoria
            </label>
            <textarea
              id={`improvements-${id}`}
              placeholder='Justifique sua nota'
              value={improvements}
              onChange={e => onImprovementsChange(e.target.value)}
              className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
            />
          </div>
        </div>
      </div>
    </div>
  );
};
