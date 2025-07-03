import { LuFilePenLine } from 'react-icons/lu';
import BaseCard from '../dashboard/components/BaseCard';
import DetailedScoreCard from '../dashboard/components/DetailedScoreCard';
import BrutalFactsHeader from './components/BrutalFactsHeader';
import BrutalFactsSummary from './components/BrutalFactsSummary';
import PerformanceChartContainer from './components/PerformanceChartContainer';
import EqualizationTableContainer from './components/EqualizationTableContainer';
import { FaSortAmountUp, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import {
  transformCollaboratorData,
  processMetricsForCards,
  // generateInsightsText,
  generateHistoricalPerformanceData,
} from '../../../utils/brutalFactsUtils';
import type { BrutalFactsMetricsDto, TeamAnalysisDto, ProcessedCollaboratorData } from '../../../types/brutalFacts';
import ManagerService from '../../../services/ManagerService';

const ManagerBrutalFacts = () => {
  const [selectedMetric, setSelectedMetric] = useState('finalScore');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brutalFactsData, setBrutalFactsData] = useState<BrutalFactsMetricsDto | null>(null);
  const [teamAnalysisData, setTeamAnalysisData] = useState<TeamAnalysisDto | null>(null);
  const [processedCollaborators, setProcessedCollaborators] = useState<ProcessedCollaboratorData[]>([]);

  const currentCycle = '2025.1';

  // Opções para o filtro do gráfico
  const metricOptions = [
    { value: 'finalScore', label: 'Nota Final' },
    { value: 'selfScore', label: 'Autoavaliação' },
    { value: 'managerScore', label: 'Avaliação do Gestor' },
  ];

  // Carrega dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, analysisData] = await Promise.all([
          ManagerService.getBrutalFactsMetrics(currentCycle),
          ManagerService.getTeamAnalysis(currentCycle),
        ]);

        setBrutalFactsData(metricsData);
        setTeamAnalysisData(analysisData);

        // Processa colaboradores para uso nos componentes
        const processed = metricsData.collaboratorsMetrics.map(transformCollaboratorData);
        setProcessedCollaborators(processed);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Usando dados de exemplo.');
        // Em caso de erro, usa dados mockados
        setProcessedCollaborators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCycle]);

  const handleDownload = () => {
    // TODO: Implementar lógica de download dos brutal facts
    console.log('Download dos brutal facts iniciado');
  };

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className='h-screen flex flex-col items-center justify-center'>
        <div className='text-lg text-gray-600'>Carregando dados...</div>
      </div>
    );
  }

  // Dados para usar nos componentes (reais ou fallback)
  const collaboratorsToUse = processedCollaborators.length > 0 ? processedCollaborators : [];
  const metricsToUse = processMetricsForCards(
    brutalFactsData || {
      cycle: currentCycle,
      overallScoreAverage: null,
      performanceImprovement: null,
      collaboratorsEvaluatedCount: collaboratorsToUse.length,
      teamPerformance: {
        selfAssessmentTeamAverage: 4.2,
        managerAssessmentTeamAverage: 4.3,
        finalScoreTeamAverage: null,
      },
      collaboratorsMetrics: [],
    },
  );

  // Gera dados de performance histórica baseados nos dados reais ou usa fallback
  const performanceDataToUse = brutalFactsData ? generateHistoricalPerformanceData(brutalFactsData) : [];

  function getScoreText(score: number | null): string {
    if (score === null) return 'N/A';
    if (score >= 4.5) return 'Excelente';
    if (score >= 3.5) return 'Bom';
    return 'Precisa Melhorar';
  }

  return (
    <div className='h-screen flex flex-col'>
      {/* Header */}
      <BrutalFactsHeader onToggleDownload={handleDownload} />

      {/* Mensagem de erro se houver */}
      {error && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mt-8'>
          <div className='flex'>
            <div className='text-yellow-600'>
              <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 pt-8'>
        <DetailedScoreCard
          title='Nota média geral'
          description={`Em comparação ao ciclo anterior.`}
          score={metricsToUse.overallScoreAverage}
          ratingText={getScoreText(metricsToUse.overallScoreAverage)}
          color='#419958'
          icon={<FaStar size={32} />}
        />
        <BaseCard
          title={'Desempenho de liderados'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#F5AA30' }}></div>
              <p className='text-sm text-gray-600 font-normal'>{}</p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#F5AA30' }}>{<FaSortAmountUp size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#F5AA30' }}>
                  {metricsToUse.performanceImprovement?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          }
        />
        <BaseCard
          title={'Colaboradores avaliados'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#08605F' }}></div>
              <p className='text-sm text-gray-600 font-normal'>
                {`Foram avaliados ${metricsToUse.collaboratorsEvaluatedCount} colaborador${metricsToUse.collaboratorsEvaluatedCount > 1 ? 'es' : ''} liderado${metricsToUse.collaboratorsEvaluatedCount > 1 ? 's' : ''} por você`}
              </p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#08605F' }}>{<LuFilePenLine size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#08605F' }}>
                  {metricsToUse.collaboratorsEvaluatedCount}
                </span>
              </div>
            </div>
          }
        />
      </div>

      {/* Container de Resumo */}
      <BrutalFactsSummary
        title='Resumo'
        summaryText={teamAnalysisData?.feedbackAnalysisSummary || 'Nenhum resumo encontrado.'}
      />

      {/* Container de Desempenho com Gráfico */}
      <PerformanceChartContainer
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        performanceData={performanceDataToUse}
        metricOptions={metricOptions}
        insightText={teamAnalysisData?.scoreAnalysisSummary || 'Nenhum resumo encontrado.'}
      />

      {/* Container da Tabela de Equalizações */}
      <EqualizationTableContainer collaboratorsData={collaboratorsToUse} />
    </div>
  );
};

export default ManagerBrutalFacts;
