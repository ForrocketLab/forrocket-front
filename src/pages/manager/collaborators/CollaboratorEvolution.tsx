import { useEffect, useMemo, useState } from 'react';
import CollaboratorHistoryChart from './components/CollaboratorHistoryChart';
import CollaboratorCycleHistory from './components/CollaboratorCycleHistory';
import EvaluationService from '../../../services/EvaluationService';
import ManagerService from '../../../services/ManagerService';
import DetailedScoreCard from '../../../components/cards/DetailedScoreCard';
import ImprovePercentageCard from '../../../components/cards/ImprovePercentageCard';
import EvaluationsFinishedCard from '../../../components/cards/EvaluationsFinishedCard';

const CollaboratorEvolution = () => {
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryDto>();
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [availableCycles, setAvailableCycles] = useState<string[]>([]);

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const activeCycle = await ManagerService.getActiveCycle();
        setSelectedCycle(activeCycle.name);
      } catch (err) {
        console.error('Erro ao carregar ciclo ativo:', err);
      }
    };
    fetchActiveCycle();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await EvaluationService.getPerformanceHistory();
        setPerformanceHistory(data);

        // Extrair ciclos únicos dos dados de performance e ordenar do mais recente para o mais antigo
        const cycles = data.performanceData
          .map(p => p.cycle)
          .filter((cycle, index, self) => self.indexOf(cycle) === index);
        setAvailableCycles(cycles);
      } catch (err) {
        console.error('Erro ao carregar histórico de performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efeito separado para definir o ciclo padrão quando os dados chegam
  useEffect(() => {
    if (availableCycles.length > 0 && !selectedCycle) {
      setSelectedCycle(availableCycles[0]);
    }
  }, [availableCycles, selectedCycle]);

  const cardData = useMemo(() => {
    const completedCycles = performanceHistory?.performanceData.filter(p => typeof p.finalScore === 'number');

    // dados do ciclo mais recente
    const mostRecentCycle = performanceHistory?.performanceData[0];
    const recentScore = mostRecentCycle ? mostRecentCycle.finalScore : null;
    const recentCycleName = mostRecentCycle?.cycle;

    // calculo de crescimento entre os dois últimos ciclos concluídos
    let growth = null;
    let comparisonCycleName = 'anterior';
    if (completedCycles != undefined && completedCycles.length >= 2) {
      const lastCompletedScore = completedCycles[0].finalScore!;
      const previousCompletedScore = completedCycles[1].finalScore!;
      growth = lastCompletedScore - previousCompletedScore;
      comparisonCycleName = completedCycles[1].cycle;
    }

    // numero total de avaliações
    const totalEvaluations = performanceHistory?.assessmentsSubmittedCount ?? 0;

    return {
      recentScore,
      recentCycleName,
      growth,
      comparisonCycleName,
      totalEvaluations,
    };
  }, [performanceHistory]);

  console.log('loading', loading);

  const handleCycleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCycle(event.target.value);
  };

  return (
    <div className='p-4 md:p-8 bg-gray-100 min-h-screen'>
      {/* Header */}
      <div className='bg-white shadow-md p-6 mb-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Evolução de {selectedCycle || 'Carregando...'}</h1>
          <div className='flex items-center gap-2'>
            <label htmlFor='cycle-select' className='text-sm font-medium text-gray-700'>
              Ciclo:
            </label>
            <select
              id='cycle-select'
              value={selectedCycle}
              onChange={handleCycleChange}
              className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
            >
              {availableCycles.map(cycle => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <DetailedScoreCard
          title='Sua Nota Atual'
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

      <CollaboratorHistoryChart performanceHistory={performanceHistory?.performanceData ?? []} />

      <CollaboratorCycleHistory performanceHistory={performanceHistory?.performanceData ?? []} />
    </div>
  );
};

export default CollaboratorEvolution;
