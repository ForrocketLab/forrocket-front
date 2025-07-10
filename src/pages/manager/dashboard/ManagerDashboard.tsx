import CycleStatus, { CycleData } from './components/CycleStatus';
import CollaboratorsTableWithPagination from '../../../components/CollaboratorsTableWithPagination';
import { useEffect, useState, useCallback } from 'react';
import DashboardService from '../../../services/ManagerService';
import { useAuth } from '../../../hooks/useAuth';
import DetailedScoreCard from '../../../components/cards/DetailedScoreCard';
import DetailedEvaluationsCard from '../../../components/cards/DetailedEvaluationsCard';
import PendingReviewsCard from '../../../components/cards/PendingReviewsCard';

const ManagerDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<ManagerDashboardResponse | null>(null);
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
  const [availableCycles, setAvailableCycles] = useState<CycleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaboratorsList, setCollaboratorsList] = useState<DashboardSubordinate[]>([]);

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  // Função para carregar dados do dashboard de um ciclo específico
  const loadDashboardData = useCallback(async (cycleName: string) => {
    try {
      const data = await DashboardService.getManagerDashboard(cycleName);
      setDashboardData(data);

      // Extract all collaborators from the response
      const allCollaborators = data.collaboratorsInfo.flatMap(projectGroup => projectGroup.subordinates);
      setCollaboratorsList(allCollaborators);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      throw err;
    }
  }, []);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar ciclo ativo
        const activeCycle = await DashboardService.getActiveCycle();
        const formattedCurrentCycle: CycleData = {
          name: activeCycle.name,
          status: activeCycle.status,
        };
        setCurrentCycle(formattedCurrentCycle);

        // Carregar dados do dashboard para o ciclo ativo
        await loadDashboardData(activeCycle.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    user?.roles.forEach(role => {
      console.log(`Usuário tem o papel: ${role}`);
    });
  }, [user?.roles, loadDashboardData]); // Adicionado loadDashboardData nas dependências

  // Carregar ciclos disponíveis separadamente
  useEffect(() => {
    const loadAvailableCycles = async () => {
      try {
        setIsLoadingCycles(true);
        const cycles = await DashboardService.getAllCycles();
        const formattedCycles: CycleData[] = cycles.map(cycle => ({
          name: cycle.name,
          status: cycle.status,
        }));
        setAvailableCycles(formattedCycles);
      } catch (err) {
        console.error('Erro ao carregar ciclos:', err);
        // Em caso de erro, mantém apenas o ciclo atual se existe
        if (currentCycle) {
          setAvailableCycles([currentCycle]);
        }
      } finally {
        setIsLoadingCycles(false);
      }
    };

    // Só carrega os ciclos se ainda não foram carregados
    if (currentCycle && availableCycles.length === 0) {
      loadAvailableCycles();
    }
  }, [currentCycle, availableCycles.length]); // Dependências controladas

  // Lidar com mudança de ciclo
  const handleCycleChange = useCallback(
    async (newCycle: CycleData) => {
      if (newCycle.name === currentCycle?.name) return;

      try {
        setIsLoading(true);
        setError(null);

        // Atualizar ciclo atual
        setCurrentCycle(newCycle);

        // Carregar dados do novo ciclo
        await loadDashboardData(newCycle.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar dados do ciclo selecionado.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentCycle, loadDashboardData],
  );

  // 3. Renderização condicional
  if (isLoading) {
    return <div className='p-8'>Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className='p-8 text-red-600'>Erro: {error}</div>;
  }

  if (!dashboardData || !currentCycle) {
    return <div className='p-8'>Nenhum ciclo de avaliação ativo encontrado.</div>;
  }

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
      <CycleStatus
        currentCycle={currentCycle}
        availableCycles={availableCycles}
        onCycleChange={handleCycleChange}
        isLoadingCycles={isLoadingCycles}
      />

      {/* Cards de Resumo */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <DetailedScoreCard
          title='Sua Nota Atual'
          description={`Nota final do ciclo realizado em ${currentCycle.name}.`}
          score={typeof dashboardData.summary.overallScore === 'number' ? dashboardData.summary.overallScore : null}
        />
        <DetailedEvaluationsCard
          title='Preenchimento do Time'
          description={`${dashboardData.summary.completionPercentage} por cento dos seus liderados já fecharam suas avaliações`}
          percentage={dashboardData.summary.completionPercentage}
        />
        <PendingReviewsCard title='Revisões Pendentes' pendingCount={dashboardData.summary.incompleteReviews} />
      </div>

      <CollaboratorsTableWithPagination collaborators={collaboratorsList} viewMoreLink='/manager/collaborators' />
    </div>
  );
};

export default ManagerDashboardPage;
