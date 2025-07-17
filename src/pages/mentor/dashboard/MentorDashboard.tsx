// pages/mentor/dashboard/MentorDashboardPage.tsx

import CycleStatus, { CycleData } from '../../manager/dashboard/components/CycleStatus';
import MenteesTableWithPagination from '../../../components/tables/MenteesTableWithPagination';
import { useEffect, useState, useCallback } from 'react';
import MentorService, { MentorDashboardResponse, MentoredCollaborator } from '../../../services/MentorService';
import { useAuth } from '../../../hooks/useAuth';
import DetailedScoreCard from '../../../components/cards/DetailedScoreCard';
import DetailedEvaluationsCard from '../../../components/cards/DetailedEvaluationsCard';
import EvaluationsFinishedCard from '../../../components/cards/EvaluationsFinishedCard';

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
      const adaptedMentees: DashboardSubordinate[] = data.mentoredCollaborators.map((mentee: MentoredCollaborator) => ({
        id: mentee.collaboratorId,
        name: mentee.collaboratorName,
        initials: mentee.initials,
        jobTitle: mentee.jobTitle,
        assessmentStatus: mentee.mentorAssessmentStatus, // O tipo já é compatível
        selfAssessmentScore: mentee.selfAssessmentAverage,
        managerScore: mentee.managerAssessmentAverage,
      }));
      setMenteesList(adaptedMentees);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard do mentor:', err);
      throw err;
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const activeCycle = await MentorService.getActiveCycle();
        const formattedCurrentCycle: CycleData = {
          name: activeCycle.name,
          status: activeCycle.status,
        };
        setCurrentCycle(formattedCurrentCycle);

        await loadDashboardData(activeCycle.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [loadDashboardData]);

  // Carregar ciclos disponíveis
  useEffect(() => {
    const loadAvailableCycles = async () => {
      if (!currentCycle) return;
      try {
        setIsLoadingCycles(true);
        const cycles = await MentorService.getAllCycles();
        const formattedCycles: CycleData[] = cycles.map(cycle => ({
          name: cycle.name,
          status: cycle.status,
        }));
        setAvailableCycles(formattedCycles);
      } catch (err) {
        console.error('Erro ao carregar ciclos:', err);
        setAvailableCycles([currentCycle]);
      } finally {
        setIsLoadingCycles(false);
      }
    };

    if (availableCycles.length === 0) {
      loadAvailableCycles();
    }
  }, [currentCycle, availableCycles.length]);

  // Lidar com mudança de ciclo
  const handleCycleChange = async (cycle: CycleData) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentCycle(cycle);
      await loadDashboardData(cycle.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do ciclo.');
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

        {/* Cards de resumo - AGORA USANDO OS DADOS CORRETOS DA API */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <DetailedScoreCard
            title='Sua Média como Mentor'
            description='Média das avaliações que você recebeu'
            score={dashboardData.summary.mentoringAssessmentAverage}
          />
          <DetailedEvaluationsCard
            title='Progresso do Ciclo'
            description='Percentual de conclusão das avaliações dos mentorados'
            percentage={dashboardData.summary.completionPercentage}
          />
          <EvaluationsFinishedCard
            title='Avaliações Pendentes'
            count={dashboardData.summary.pendingReviews}
            description='Avaliações de mentorados que ainda não foram concluídas'
          />
        </div>

        {/* Tabela de mentorados */}
        <MenteesTableWithPagination mentees={menteesList} />
      </div>
    </div>
  );
};

export default MentorDashboardPage;
