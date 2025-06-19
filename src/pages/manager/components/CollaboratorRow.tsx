import { type FC } from 'react';
import { ChevronRight } from 'lucide-react';

// Tipos e Interface definidos acima
type Status = 'Pendente' | 'Em andamento' | 'Finalizado';

export interface CollaboratorRowProps {
  initials: string;
  name: string;
  jobTitle: string;
  status: Status;
  selfAssessmentScore: number | null;
  managerScore: number | null;
}

const CollaboratorRow = ({
  initials,
  name,
  jobTitle,
  status,
  selfAssessmentScore,
  managerScore,
}: CollaboratorRowProps) => {
  // Lógica para definir a cor do chip de status
  const statusStyles = {
    Pendente: 'bg-[#BEE7CF] text-[#419958]',
    'Em andamento': 'bg-[#FEF5B2] text-[#F5AA30]',
    Finalizado: 'bg-gray-200 text-gray-800', // Adicionei um estilo para 'Finalizado' como exemplo
  }[status];

  // Lógica para definir a cor do chip de nota do gestor
  const managerScoreStyles = managerScore
    ? 'bg-[#08605F] text-white' // Se tiver nota
    : 'bg-[#E6E6E6] text-black'; // Se não tiver nota

  return (
    // Container da linha com borda, radius e padding
    <div className='flex items-center w-full p-4 border border-gray-200 rounded-xl mb-3'>
      {/* Parte Esquerda: Iniciais, Nome/Cargo e Status */}
      <div className='flex items-center flex-1'>
        <span className='bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-700 text-sm uppercase mr-4'>
          {initials}
        </span>
        <div className='flex flex-col mr-6'>
          <span className='font-bold text-gray-800'>{name}</span>
          <span className='text-sm text-gray-500'>{jobTitle}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles}`}>{status}</span>
      </div>

      {/* Parte Direita: Notas e Ícone */}
      <div className='flex items-center gap-6'>
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
        <button>
          <ChevronRight size={14} className='text-[#08605F]' />
        </button>
      </div>
    </div>
  );
};

export default CollaboratorRow;
