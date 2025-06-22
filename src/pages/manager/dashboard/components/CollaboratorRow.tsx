// src/pages/manager/components/CollaboratorRow.tsx
import { type FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

type Status = 'PENDING' | 'DRAFT' | 'SUBMITTED';

export interface CollaboratorRowProps {
  id: string; // <-- Certifique-se que o ID está nas props, ele é crucial para a navegação
  initials: string;
  name: string;
  jobTitle: string;
  status: Status;
  selfAssessmentScore: number | null;
  managerScore: number | null;
}

const CollaboratorRow: FC<CollaboratorRowProps> = ({
  id, // <-- Pegue o ID das props
  initials,
  name,
  jobTitle,
  status,
  selfAssessmentScore,
  managerScore,
}) => {
  const navigate = useNavigate(); // <-- Instancie o hook

  const statusStyles = {
    PENDING: 'bg-[#BEE7CF] text-[#419958]',
    DRAFT: 'bg-[#FEF5B2] text-[#F5AA30]',
    SUBMITTED: 'bg-gray-200 text-gray-800',
  }[status];

  const managerScoreStyles = managerScore ? 'bg-[#08605F] text-white' : 'bg-[#E6E6E6] text-black';

  function getStatus(status: Status) {
    switch (status) {
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
    <div className='flex flex-col md:flex-row md:items-center w-full p-4 border border-gray-200 rounded-xl mb-3 gap-4 md:gap-0'>
      {/* Parte Esquerda: Iniciais, Nome/Cargo e Status */}
      <div className='flex items-center flex-1'>
        <span className='bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 text-sm uppercase mr-4'>
          {initials}
        </span>
        <div className='flex flex-col mr-6'>
          <span className='font-bold text-gray-800'>{name}</span>
          <span className='text-sm text-gray-500'>{jobTitle}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusStyles}`}>
          {getStatus(status)}
        </span>
      </div>

      {/* Parte Direita: Notas e Ícone */}
      <div className='flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Autoavaliação</span>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {selfAssessmentScore ?? '-'}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Nota gestor</span>
          <div
            className={`flex items-center justify-center w-12 h-7 font-bold text-sm rounded-md ${managerScoreStyles}`}
          >
            {managerScore ?? '-'}
          </div>
        </div>
        <button
          onClick={handleNavigateToDetails} // <-- Adicione o onClick aqui
          className='flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors' // Estilo para o botão
          title={`Ver detalhes da avaliação de ${name}`} // Acessibilidade
        >
          <ChevronRight size={24} className='text-[#08605F]' />
        </button>
      </div>
    </div>
  );
};

export default CollaboratorRow;