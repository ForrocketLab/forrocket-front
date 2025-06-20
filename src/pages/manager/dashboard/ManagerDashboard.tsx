import { FaStar } from 'react-icons/fa';
import CycleStatus from '../components/CycleStatus';
import DetailedScoreCard from '../components/DetailedScoreCard';
import DetailedEvaluationsCard from '../components/DetailedEvaluationsCard';
import PendingReviewsCard from '../components/PendingReviewsCard';
import CollaboratorsTable from '../components/CollaboratorsTable';
import { useEffect, useState } from 'react';
import DashboardService from '../../../services/DashboardService';
import { useAuth } from '../../../hooks/useAuth';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<ManagerDashboardResponse | null>(null);
  const [activeCycle, setActiveCycle] = useState<ActiveCycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cycle = await DashboardService.getActiveCycle();
        setActiveCycle(cycle);

        if (cycle) {
          const data = await DashboardService.getManagerDashboard(cycle.name);
          setDashboardData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    user?.roles.forEach(role => {
      console.log(`Usuário tem o papel: ${role}`);
    });
  }, []);

  // 3. Renderização condicional
  if (isLoading) {
    return <div className='p-8'>Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className='p-8 text-red-600'>Erro: {error}</div>;
  }

  if (!dashboardData || !activeCycle) {
    return <div className='p-8'>Nenhum ciclo de avaliação ativo encontrado.</div>;
  }

  const allCollaborators = dashboardData.collaboratorsInfo.flatMap(projectGroup => projectGroup.subordinates);

  return (
    <div className='bg-gray-100 min-h-screen'>
      {/* Olá, Gestor e Botão de Perfil */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-semibold text-gray-800'>Olá, Gestor</h1>
        <button className='bg-gray-300 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center uppercase font-semibold'>
          {userInitials}
        </button>
      </div>

      {/* Indicador do Ciclo */}
      <CycleStatus cycleName={activeCycle.name} isActive={activeCycle.status === 'OPEN'} />

      {/* Cards de Resumo */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <DetailedScoreCard
          title='Sua Nota Atual'
          description={`Nota final do ciclo realizado em ${activeCycle.name}.`}
          score={dashboardData.summary.overallScore ?? '-'}
          ratingText={dashboardData.summary.overallScore ? 'Great' : 'N/A'}
          color='#419958'
          icon={<FaStar size={32} />}
        />
        <DetailedEvaluationsCard
          title='Preenchimento do Time'
          description={`${dashboardData.summary.completionPercentage} dos seus liderados já fecharam suas avaliações`}
          percentage={dashboardData.summary.completionPercentage}
        />
        <PendingReviewsCard
          title='Revisões Pendentes'
          description='Conclua suas revisões de notas'
          pendingCount={dashboardData.summary.incompleteReviews}
        />
      </div>

      <CollaboratorsTable collaborators={allCollaborators} />
    </div>
  );
};

export default ManagerDashboard;
