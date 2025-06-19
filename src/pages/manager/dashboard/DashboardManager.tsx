import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import CycleStatus from '../components/CycleStatus';
import DetailedScoreCard from '../components/DetailedScoreCard';
import DetailedEvaluationsCard from '../components/DetailedEvaluationsCard';
import PendingReviewsCard from '../components/PendingReviewsCard';
import type { CollaboratorRowProps } from '../components/CollaboratorRow';
import CollaboratorsTable from '../components/CollaboratorsTable';

// Define os possíveis status para garantir consistência
type CollaboratorStatus = 'Em andamento' | 'Finalizado' | 'Pendente';

// Interface para as props do CollaboratorItem
interface CollaboratorItemProps {
  name: string;
  project: string;
  status: CollaboratorStatus;
  selfScore: string | number;
  managerScore: string | number;
}

// Componente para a linha de cada colaborador
const CollaboratorItem = ({ name, project, status, selfScore, managerScore }: CollaboratorItemProps) => {
  let statusColorClass = 'bg-gray-300 text-gray-700';
  if (status === 'Em andamento') {
    statusColorClass = 'bg-yellow-200 text-yellow-800';
  } else if (status === 'Finalizado') {
    statusColorClass = 'bg-green-200 text-green-800';
  }

  return (
    <div className='bg-white rounded-md shadow-sm p-4 mb-2 flex items-center justify-between'>
      <div className='flex items-center'>
        <span className='bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center uppercase font-semibold mr-3'>
          CN
        </span>
        <div>
          <h4 className='font-semibold text-gray-800'>{name}</h4>
          <p className='text-sm text-gray-500'>{project}</p>
        </div>
        <span className='ml-4 px-2 py-1 rounded-full text-xs font-semibold ${statusColorClass}'>{status}</span>
      </div>
      <div className='flex items-center text-gray-600'>
        <span className='text-sm mr-2'>Autoavaliação</span>
        <span className='font-semibold'>{selfScore}</span>
        <span className='ml-4 text-sm mr-2'>Nota gestor</span>
        <button className='border border-gray-400 rounded-md px-2 py-1 text-sm font-semibold'>{managerScore}</button>
        <button className='ml-4'>
          <ChevronRight className='text-gray-500' />
        </button>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC = () => {
  const collaboratorsData: CollaboratorRowProps[] = [
    {
      initials: 'AO',
      name: 'Ana Oliveira',
      jobTitle: 'Product Designer',
      status: 'Em andamento',
      selfAssessmentScore: 4.0,
      managerScore: null,
    },
    {
      initials: 'BM',
      name: 'Bruno Mendes',
      jobTitle: 'Software Engineer',
      status: 'Pendente',
      selfAssessmentScore: null,
      managerScore: null,
    },
    {
      initials: 'CD',
      name: 'Carla Dias',
      jobTitle: 'Data Analyst',
      status: 'Finalizado',
      selfAssessmentScore: 4.5,
      managerScore: 4.8,
    },
  ];
  return (
    <div className='bg-gray-100 min-h-screen'>
      {/* Olá, Gestor e Botão de Perfil */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-semibold text-gray-800'>Olá, Gestor</h1>
        <button className='bg-gray-300 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center uppercase font-semibold'>
          CN
        </button>
      </div>

      {/* Indicador do Ciclo */}
      <CycleStatus cycleName='2025.1' isActive={false} daysRemaining={15} key={2025.1} />

      {/* Cards de Resumo */}
      <div className='flex space-x-4 mb-6'>
        <DetailedScoreCard
          title='Nota atual'
          description='Nota final do ciclo realizado em 2024.2.'
          score={4.5}
          ratingText='Great'
          color='#419958'
          icon={<FaStar size={43} />}
        />
        <DetailedEvaluationsCard
          title='Preenchimento de avaliação'
          description='40% dos seus liderados já fecharam suas avaliações'
          percentage={40}
        />
        <PendingReviewsCard title='Revisões Pendentes' description='Conclua suas revisões de nota.' pendingCount={10} />
      </div>

      <CollaboratorsTable collaborators={collaboratorsData} />
    </div>
  );
};

export default ManagerDashboard;
