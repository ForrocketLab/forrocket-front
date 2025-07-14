import CycleStatus, { CycleData } from '../../manager/dashboard/components/CycleStatus';
import MenteesTableWithPagination from '../../../components/tables/MenteesTableWithPagination';
import { useEffect, useState, useCallback } from 'react';
import MentorService, { MentorDashboardResponse } from '../../../services/MentorService';
import { useAuth } from '../../../hooks/useAuth';
import DetailedScoreCard from '../../../components/cards/DetailedScoreCard';
import DetailedEvaluationsCard from '../../../components/cards/DetailedEvaluationsCard';
import PendingReviewsCard from '../../../components/cards/PendingReviewsCard';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<MentorDashboardResponse | null>(null);
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
  const [availableCycles, setAvailableCycles] = useState<CycleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menteesList, setMenteesList] = useState<DashboardSubordinate[]>([]);

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  // Função para carregar dados do dashboard de um ciclo específico
  const loadDashboardData = useCallback(async (cycleName: string) => {
    try {
      const data = await MentorService.getMentorDashboard(cycleName);
      setDashboardData(data);

      // Adaptar mentorados para o formato esperado pela tabela
      const adaptedMentees: DashboardSubordinate[] = data.mentoredCollaborators.map(mentee => {
        // Mapear status do mentor para o formato esperado pela tabela
        let assessmentStatus: 'PENDING' | 'DRAFT' | 'SUBMITTED';
        switch (mentee.mentorAssessmentStatus) {
          case 'PENDING':
            assessmentStatus = 'PENDING';
            break;
          case 'DRAFT':
            assessmentStatus = 'DRAFT';
            break;
          case 'SUBMITTED':
            assessmentStatus = 'SUBMITTED';
            break;
          default:
            assessmentStatus = 'PENDING';
        }

        return {
          id: mentee.collaboratorId,
          name: mentee.collaboratorName,
          initials: mentee.initials,
          jobTitle: mentee.jobTitle,
          assessmentStatus,
          selfAssessmentScore: mentee.selfAssessmentAverage,
          managerScore: mentee.managerAssessmentAverage,
        };
      });
      setMenteesList(adaptedMentees);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard do mentor:', err);
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
        const activeCycle = await MentorService.getActiveCycle();
        const formattedCurrentCycle: CycleData = {
          name: activeCycle.name,
          status: activeCycle.status,
        };
        setCurrentCycle(formattedCurrentCycle);

        // Carregar dados do dashboard para o ciclo ativo
        await loadDashboardData(activeCycle.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o dashboard do mentor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    user?.roles.forEach(role => {
      console.log(`Usuário tem o papel: ${role}`);
    });
  }, [user?.roles, loadDashboardData]);

  // Carregar ciclos disponíveis separadamente
  useEffect(() => {
    const loadAvailableCycles = async () => {
      try {
        setIsLoadingCycles(true);
        const cycles = await MentorService.getAllCycles();
        const formattedCycles: CycleData[] = cycles.map((cycle: { name: string; status: string }) => ({
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
  }, [currentCycle, availableCycles.length]);

  // Lidar com mudança de ciclo
  const handleCycleChange = async (cycle: CycleData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Atualizar ciclo atual
      setCurrentCycle(cycle);

      // Carregar dados do novo ciclo
      await loadDashboardData(cycle.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do ciclo selecionado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]'></div>
        <p className='ml-4 text-gray-700'>Carregando dashboard do mentor...</p>
      </div>
    );
  }

  if (error || !dashboardData || !currentCycle) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar dashboard</h3>
          <p className='text-gray-600 mb-4'>{error || 'Dados não encontrados'}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors'
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Calcular porcentagem de avaliações completadas
  const completionPercentage =
    dashboardData.summary.activeAssessments > 0
      ? Math.round((dashboardData.summary.completedAssessments / dashboardData.summary.activeAssessments) * 100)
      : 0;

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Dashboard do Mentor</h1>
              <p className='text-gray-600'>Acompanhe o progresso dos seus mentorados</p>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-[#085F60] text-white rounded-full flex items-center justify-center font-semibold'>
                {userInitials}
              </div>
              <div>
                <p className='text-sm font-medium text-gray-900'>{user?.name}</p>
                <p className='text-xs text-gray-500'>Mentor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cycle Status */}
        <div className='mb-6'>
          <CycleStatus
            currentCycle={currentCycle}
            availableCycles={availableCycles}
            onCycleChange={handleCycleChange}
            isLoadingCycles={isLoadingCycles}
          />
        </div>

        {/* Cards de resumo */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <DetailedScoreCard
            title='Score Médio'
            description='Média das últimas avaliações'
            score={dashboardData.summary.averageScore}
          />
          <DetailedEvaluationsCard
            title='Progresso das Avaliações'
            description='Avaliações completadas'
            percentage={completionPercentage}
          />
          <PendingReviewsCard title='Mentorados' pendingCount={dashboardData.summary.totalMentees} />
        </div>

        {/* Tabela de mentorados */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>Meus Mentorados</h2>
            <p className='text-sm text-gray-500 mt-1'>Lista completa dos colaboradores sob sua mentoria</p>
          </div>
          <div className='p-6'>
            <MenteesTableWithPagination mentees={menteesList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardPage;
