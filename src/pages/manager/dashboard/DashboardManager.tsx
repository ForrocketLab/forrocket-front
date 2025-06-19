import { FaStar } from 'react-icons/fa';
import CycleStatus from '../components/CycleStatus';
import DetailedScoreCard from '../components/DetailedScoreCard';
import DetailedEvaluationsCard from '../components/DetailedEvaluationsCard';
import PendingReviewsCard from '../components/PendingReviewsCard';
import type { CollaboratorRowProps } from '../components/CollaboratorRow';
import CollaboratorsTable from '../components/CollaboratorsTable';

const ManagerDashboard = () => {
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
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <DetailedScoreCard
          title='Nota atual'
          description='Nota final do ciclo realizado em 2024.2.'
          score={4.5}
          ratingText='Great'
          color='#419958'
          icon={<FaStar size={32} />}
        />
        <DetailedEvaluationsCard
          title='Preenchimento de avaliação'
          description='60% dos seus liderados já fecharam suas avaliações'
          percentage={60}
        />
        <PendingReviewsCard title='Revisões Pendentes' description='Conclua suas revisões de nota.' pendingCount={10} />
      </div>

      <CollaboratorsTable collaborators={collaboratorsData} />
    </div>
  );
};

export default ManagerDashboard;
