import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CollaboratorHistoryChart from '../../../manager/collaborators/components/CollaboratorHistoryChart';
import CollaboratorCycleHistory from '../../../manager/collaborators/components/CollaboratorCycleHistory';
import MentorService, { MenteeCompletePerformance } from '../../../../services/MentorService';
import DetailedScoreCard from '../../../../components/cards/DetailedScoreCard';
import ImprovePercentageCard from '../../../../components/cards/ImprovePercentageCard';
import EvaluationsFinishedCard from '../../../../components/cards/EvaluationsFinishedCard';
import { CustomSelect } from '../../../../components/CustomSelect';

const MenteeEvolution = () => {
  const { id: menteeId } = useParams<{ id: string }>();
  const [menteeData, setMenteeData] = useState<MenteeCompletePerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [availableCycles, setAvailableCycles] = useState<string[]>([]);

  // Buscar ciclos disponíveis e definir o ciclo ativo como padrão
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const cycles = await MentorService.getAllCycles();
        const cycleNames = cycles.filter(cycle => cycle.status !== 'UPCOMING').map(cycle => cycle.name);
        setAvailableCycles(cycleNames);

        // Definir ciclo ativo como padrão
        const activeCycle = cycles.find(cycle => cycle.status === 'ACTIVE');
        if (activeCycle) {
          setSelectedCycle(activeCycle.name);
        } else if (cycleNames.length > 0) {
          setSelectedCycle(cycleNames[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar ciclos:', err);
      }
    };
    fetchCycles();
  }, []);

  // Buscar dados de performance quando menteeId ou selectedCycle mudar
  useEffect(() => {
    const fetchData = async () => {
      if (!menteeId || !selectedCycle) return;

      setLoading(true);
      try {
        const data = await MentorService.getMenteeCompletePerformance(menteeId, selectedCycle);
        setMenteeData(data);
      } catch (err) {
        console.error('Erro ao carregar dados completos do mentee:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [menteeId, selectedCycle]);

  const cardData = useMemo(() => {
    if (!menteeData) {
      return {
        recentScore: null,
        recentCycleName: selectedCycle,
        growth: null,
        comparisonCycleName: 'anterior',
        totalEvaluations: 0,
      };
    }

    // Usar os dados já calculados no backend
    const recentScore = menteeData.performance.committeeOverallScore;
    const growth = menteeData.performance.performanceGrowth;
    const totalEvaluations = menteeData.performance.totalAssessmentsCompleted;

    return {
      recentScore,
      recentCycleName: selectedCycle,
      growth,
      comparisonCycleName: 'anterior',
      totalEvaluations,
    };
  }, [menteeData, selectedCycle]);

  // Transformar dados do backend para o formato esperado pelos gráficos
  const performanceDataForCharts = useMemo(() => {
    if (!menteeData) return [];

    return menteeData.cycleMeans.map(cycle => ({
      cycle: cycle.cycle,
      selfScore: {
        BEHAVIOR: cycle.selfAssessmentMean,
        EXECUTION: cycle.selfAssessmentMean,
        MANAGEMENT: cycle.selfAssessmentMean,
      },
      managerScore: {
        BEHAVIOR: cycle.managerBehaviorMean,
        EXECUTION: cycle.managerExecutionMean,
        MANAGEMENT: cycle.managerBehaviorMean,
      },
      finalScore: cycle.overallScore,
      assessments360Mean: cycle.assessments360Mean,
    }));
  }, [menteeData]);

  const handleCycleChange = (value: string) => {
    setSelectedCycle(value);
    // Os dados serão recarregados automaticamente pelo useEffect que observa selectedCycle
  };

  if (loading) {
    return (
      <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando evolução do mentee...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-100 min-h-screen'>
      {/* Header */}
      <div className='bg-white shadow-md p-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Evolução - {selectedCycle || 'Carregando...'}</h1>
          <CustomSelect
            id='cycle-select'
            value={selectedCycle}
            onChange={handleCycleChange}
            options={availableCycles.map(cycle => ({ value: cycle, label: cycle }))}
            label='Ciclo:'
            placeholder='Selecione um ciclo...'
          />
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8'>
        <DetailedScoreCard
          title='Nota Atual'
          description={`Nota final do ciclo realizado em ${cardData.recentCycleName}.`}
          score={cardData.recentScore}
        />
        <ImprovePercentageCard
          title='Crescimento'
          description={`Em comparação ao ciclo ${cardData.comparisonCycleName}`}
          percentage={cardData.growth}
        />
        <EvaluationsFinishedCard
          title='Avaliações realizadas'
          description='Total de avaliações'
          count={cardData.totalEvaluations}
        />
      </div>

      {/* Gráficos */}
      <div className='px-4 pb-4 md:px-8 md:pb-4'>
        <CollaboratorHistoryChart performanceHistory={performanceDataForCharts} />
        <CollaboratorCycleHistory performanceHistory={performanceDataForCharts} />
      </div>
    </div>
  );
};

export default MenteeEvolution;
