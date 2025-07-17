// src/pages/manager/components/CollaboratorRow.tsx
import { type FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

type AssessmentStatus = 'PENDING' | 'DRAFT' | 'SUBMITTED';

export interface CollaboratorRowProps {
  id: string; // <-- Certifique-se que o ID está nas props, ele é crucial para a navegação
  initials: string;
  name: string;
  jobTitle: string;
  assessmentStatus: AssessmentStatus;
  selfAssessmentScore: number | null;
  managerScore: number | null;
}

const CollaboratorRow: FC<CollaboratorRowProps> = ({
  id, // <-- Pegue o ID das props
  initials,
  name,
  jobTitle,
  assessmentStatus,
  selfAssessmentScore,
  managerScore,
}) => {
  const navigate = useNavigate(); // <-- Instancie o hook

  const statusStyles = {
    PENDING: 'bg-[#BEE7CF] text-[#419958]',
    DRAFT: 'bg-[#FEF5B2] text-[#F5AA30]',
    SUBMITTED: 'bg-gray-200 text-gray-800',
  }[assessmentStatus];

  const managerScoreStyles = managerScore ? 'bg-[#08605F] text-white' : 'bg-[#E6E6E6] text-black';

  function getStatus(assessmentStatus: AssessmentStatus) {
    switch (assessmentStatus) {
      case 'PENDING':
        return 'Pendente';
      case 'DRAFT':
        return 'Em andamento';
      case 'SUBMITTED':
        return 'Finalizado';
      default:
        return 'Pendente';
    }
  }

  // Função para navegar para os detalhes da avaliação
  const handleNavigateToDetails = () => {
    navigate(`/manager/collaborators/${id}/evaluations`); // <-- Navegação usando o ID
  };

  return (
    <div className='px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors'>
      <div className='grid grid-cols-12 gap-4 items-center'>
        {/* Colaborador - col-span-4 */}
        <div className='col-span-4 flex items-center'>
          <span className='bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 text-sm uppercase mr-4'>
            {initials}
          </span>
          <div className='flex flex-col'>
            <span className='font-bold text-gray-800'>{name}</span>
            <span className='text-sm text-gray-500'>{jobTitle}</span>
          </div>
        </div>

        {/* Status - col-span-2 */}
        <div className='col-span-2'>
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusStyles}`}>
            {getStatus(assessmentStatus)}
          </span>
        </div>

        {/* Autoavaliação - col-span-2 */}
        <div className='col-span-2 flex justify-center'>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {selfAssessmentScore ?? '-'}
          </div>
        </div>

        {/* Nota Gestor - col-span-2 */}
        <div className='col-span-2 flex justify-center'>
          <div
            className={`flex items-center justify-center w-12 h-7 font-bold text-sm rounded-md ${managerScoreStyles}`}
          >
            {managerScore ?? '-'}
          </div>
        </div>

        {/* Ações - col-span-2 */}
        <div className='col-span-2 flex justify-center'>
          <button
            onClick={handleNavigateToDetails}
            className='flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors hover:cursor-pointer'
            title={`Ver detalhes da avaliação de ${name}`}
          >
            <ChevronRight size={24} className='text-[#08605F]' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorRow;
