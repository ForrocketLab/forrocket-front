import { type FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type FinalScoreColor = 'green' | 'teal' | 'yellow';

export interface EqualizatedCollaboratorRowProps {
  id: string;
  initials: string;
  name: string;
  jobTitle: string;
  selfAssessmentScore: number | null;
  evaluation360Score: number | null;
  managerScore: number | null;
  finalScore: number | null;
  finalScoreColor: FinalScoreColor;
}

const EqualizatedCollaboratorRow: FC<EqualizatedCollaboratorRowProps> = ({
  id,
  initials,
  name,
  jobTitle,
  selfAssessmentScore,
  evaluation360Score,
  managerScore,
  finalScore,
  finalScoreColor,
}) => {
  const navigate = useNavigate();

  const finalScoreStyles = {
    green: 'bg-[#419958] text-white',
    teal: 'bg-[#08605F] text-white',
    yellow: 'bg-[#F5AA30] text-white',
  }[finalScoreColor];

  const handleNavigateToDetails = () => {
    navigate(`/manager/collaborators/${id}/evaluations`);
  };

  return (
    <div className='flex flex-col xl:flex-row xl:items-center w-full p-4 border border-gray-200 rounded-xl mb-3 gap-4 xl:gap-0'>
      <div className='flex items-center flex-1 min-w-0'>
        <span className='bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 text-sm uppercase mr-4'>
          {initials}
        </span>
        <div className='flex flex-col mr-6 min-w-0'>
          <span className='font-bold text-gray-800 truncate'>{name}</span>
          <span className='text-sm text-gray-500 truncate'>{jobTitle}</span>
        </div>
      </div>

      <div className='flex items-center justify-between xl:justify-end gap-3 w-full xl:w-auto flex-wrap xl:flex-nowrap'>
        {/* Autoavaliação */}
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-600 whitespace-nowrap'>Autoavaliação</span>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {selfAssessmentScore ?? '-'}
          </div>
        </div>

        {/* Avaliação 360 */}
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-600 whitespace-nowrap'>Avaliação 360</span>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {evaluation360Score ?? '-'}
          </div>
        </div>

        {/* Nota Gestor */}
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-600 whitespace-nowrap'>Nota Gestor</span>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {managerScore ?? '-'}
          </div>
        </div>

        {/* Nota Final */}
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-600 whitespace-nowrap'>Nota Final</span>
          <div className={`flex items-center justify-center w-12 h-7 font-bold text-sm rounded-md ${finalScoreStyles}`}>
            {finalScore ?? '-'}
          </div>
        </div>

        {/* Ícone de navegação */}
        <button
          onClick={handleNavigateToDetails}
          className='flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors hover:cursor-pointer ml-2'
          title={`Ver detalhes da avaliação de ${name}`}
        >
          <ChevronRight size={24} className='text-[#08605F]' />
        </button>
      </div>
    </div>
  );
};

export default EqualizatedCollaboratorRow;
