import CollaboratorHistoryChart from './components/CollaboratorHistoryChart';
import CollaboratorCycleHistory from './components/CollaboratorCycleHistory';
import { useMemo } from 'react';
import DetailedScoreCard from '../../../components/DetailedScoreCard';
import ImprovePercentageCard from '../../../components/ImprovePercentageCard';
import EvaluationsFinishedCard from '../../../components/EvaluationsFinishedCard';

interface ManagerEvaluationsHistoryProps {
  performanceHistory: PerformanceHistoryDto;
}

const ManagerEvaluationsHistory = ({ performanceHistory }: ManagerEvaluationsHistoryProps) => {
  const cardData = useMemo(() => {
    const completedCycles = performanceHistory.performanceData.filter(p => typeof p.finalScore === 'number');

    // dados do ciclo mais recente
    const mostRecentCycle = performanceHistory.performanceData[0];
    const recentScore = mostRecentCycle?.finalScore;
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
    const totalEvaluations = performanceHistory?.assessmentsSubmittedCount;

    return {
      recentScore,
      recentCycleName,
      growth,
      comparisonCycleName,
      totalEvaluations,
    };
  }, [performanceHistory]);

  return (
    <div className='p-4 md:p-8 bg-gray-100 min-h-screen'>
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

export default ManagerEvaluationsHistory;
