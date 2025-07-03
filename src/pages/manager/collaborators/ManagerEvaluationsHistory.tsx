import { useParams } from 'react-router-dom';
import DetailedScoreCard from '../dashboard/components/DetailedScoreCard';
import { FaSortAmountUp, FaStar } from 'react-icons/fa';
import BaseCard from '../dashboard/components/BaseCard';
import { LuFilePenLine } from 'react-icons/lu';
import CollaboratorHistoryChart from './components/CollaboratorHistoryChart';
import CollaboratorCycleHistory from './components/CollaboratorCycleHistory';
import { useEffect, useMemo, useState } from 'react';
import ManagerService from '../../../services/ManagerService';

const ManagerEvaluationsHistory = () => {
  const { id } = useParams();

  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryDto>();
  const [loading, setLoading] = useState(true);
  console.log('loading', loading);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.error('ID do colaborador não fornecido.');
        setLoading(false);
        return;
      }
      const data = await ManagerService.getCollaboratorPerformanceHistory(id);
      setPerformanceHistory(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const cardData = useMemo(() => {
    const completedCycles = performanceHistory?.performanceData.filter(p => typeof p.finalScore === 'number');

    // dados do ciclo mais recente
    const mostRecentCycle = performanceHistory?.performanceData[0];
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
          score={cardData.recentScore ?? '-'}
          ratingText={cardData.recentScore ? 'Great' : 'N/A'}
          color='#419958'
          icon={<FaStar size={32} />}
        />
        <BaseCard
          title={'Crescimento'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#F5AA30' }}></div>
              <p className='text-sm text-gray-600 font-normal'>{`Em comparação ao ciclo ${cardData.comparisonCycleName}`}</p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#F5AA30' }}>{<FaSortAmountUp size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#F5AA30' }}>
                  {cardData.growth !== null ? cardData.growth.toFixed(1) : '-'}
                </span>
              </div>
            </div>
          }
        />
        <BaseCard
          title={'Avaliações realizadas'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#08605F' }}></div>
              <p className='text-sm text-gray-600 font-normal'>{'Total de avaliações'}</p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#08605F' }}>{<LuFilePenLine size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#08605F' }}>
                  {cardData.totalEvaluations}
                </span>
              </div>
            </div>
          }
        />
      </div>

      <CollaboratorHistoryChart performanceHistory={performanceHistory?.performanceData ?? []} />

      <CollaboratorCycleHistory performanceHistory={performanceHistory?.performanceData ?? []} />
    </div>
  );
};

export default ManagerEvaluationsHistory;
