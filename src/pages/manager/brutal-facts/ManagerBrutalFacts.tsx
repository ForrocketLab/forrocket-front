import { LuFilePenLine } from 'react-icons/lu';
import BaseCard from '../dashboard/components/BaseCard';
import DetailedScoreCard from '../dashboard/components/DetailedScoreCard';
import BrutalFactsHeader from './components/BrutalFactsHeader';
import BrutalFactsSummary from './components/BrutalFactsSummary';
import PerformanceChartContainer from './components/PerformanceChartContainer';
import EqualizationTableContainer from './components/EqualizationTableContainer';
import { FaSortAmountUp, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import {
  transformCollaboratorData,
  processMetricsForCards,
  generateInsightsText,
  generateCombinedSummaryText,
  processHistoricalPerformanceData,
} from '../../../utils/brutalFactsUtils';
import type { 
  BrutalFactsMetricsDto, 
  TeamAnalysisDto, 
  ProcessedCollaboratorData,
  PerformanceData
} from '../../../types/brutalFacts';
import ManagerService from '../../../services/ManagerService';

const ManagerBrutalFacts = () => {
  const [selectedMetric, setSelectedMetric] = useState('finalScore');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brutalFactsData, setBrutalFactsData] = useState<BrutalFactsMetricsDto | null>(null);
  const [teamAnalysisData, setTeamAnalysisData] = useState<TeamAnalysisDto | null>(null);
  const [processedCollaborators, setProcessedCollaborators] = useState<ProcessedCollaboratorData[]>([]);
  const [historicalPerformanceData, setHistoricalPerformanceData] = useState<PerformanceData[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const toast = useGlobalToast();
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

        // Carrega dados principais
        const [metricsData, analysisData] = await Promise.all([
          ManagerService.getBrutalFactsMetrics(currentCycle),
          ManagerService.getTeamAnalysis(currentCycle),
        ]);

        setBrutalFactsData(metricsData);
        setTeamAnalysisData(analysisData);

        // Processa colaboradores para uso nos componentes
        const processed = metricsData.collaboratorsMetrics.map(transformCollaboratorData);
        setProcessedCollaborators(processed);

        // Carrega dados históricos de performance
        setHistoricalLoading(true);
        try {
          const historicalData = await ManagerService.getTeamHistoricalPerformance();
          const processedHistoricalData = processHistoricalPerformanceData(historicalData);
          setHistoricalPerformanceData(processedHistoricalData);
          
          toast.success('Dados carregados', 'Todos os dados foram carregados com sucesso.');
        } catch (historicalError) {
          console.warn('Erro ao carregar dados históricos:', historicalError);
          // Usa dados simulados se não conseguir carregar históricos
          const fallbackData: PerformanceData[] = [
            { cycle: '2023.1', finalScore: 3.8, selfScore: 3.5, managerScore: 4.1 },
            { cycle: '2023.2', finalScore: 4.2, selfScore: 4.0, managerScore: 4.4 },
            { cycle: '2024.1', finalScore: 4.0, selfScore: 3.8, managerScore: 4.2 },
            { cycle: currentCycle, finalScore: metricsData.overallScoreAverage || 4.0, selfScore: metricsData.teamPerformance.selfAssessmentTeamAverage, managerScore: metricsData.teamPerformance.managerAssessmentTeamAverage },
          ];
          setHistoricalPerformanceData(fallbackData);
          
          toast.warning('Dados principais carregados', 'Dados históricos não disponíveis. Usando dados simulados para o gráfico.');
        } finally {
          setHistoricalLoading(false);
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Usando dados de exemplo.');
        toast.error('Erro ao carregar dados', 'Não foi possível carregar os dados do servidor. Tente novamente.');
        // Em caso de erro, usa dados mockados
        setProcessedCollaborators([]);
        // Dados de fallback para o gráfico
        const fallbackData: PerformanceData[] = [
          { cycle: '2023.1', finalScore: 3.8, selfScore: 3.5, managerScore: 4.1 },
          { cycle: '2023.2', finalScore: 4.2, selfScore: 4.0, managerScore: 4.4 },
          { cycle: '2024.1', finalScore: 4.0, selfScore: 3.8, managerScore: 4.2 },
          { cycle: '2024.2', finalScore: 4.5, selfScore: 4.3, managerScore: 4.7 },
        ];
        setHistoricalPerformanceData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCycle]);

  const handleDownload = () => {
    // TODO: Implementar lógica de download dos brutal facts
    console.log('Download dos brutal facts iniciado');
  };

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className='h-screen flex flex-col items-center justify-center'>
        <LoadingSpinner className="w-12 h-12 mb-4" />
        <div className='text-lg text-gray-600'>Carregando dados...</div>
        {historicalLoading && (
          <div className='text-sm text-gray-500 mt-2'>Buscando dados históricos...</div>
        )}
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

  // Usa dados históricos reais ou fallback
  const performanceDataToUse = historicalPerformanceData.length > 0 ? historicalPerformanceData : [];

  const insightsText = teamAnalysisData 
    ? generateInsightsText(teamAnalysisData)
    : 'Os colaboradores demonstram evolução consistente nas avaliações, com destaque para o crescimento nas competências comportamentais.';

  const summaryText = teamAnalysisData
    ? generateCombinedSummaryText(teamAnalysisData)
    : 'Análise detalhada não disponível. Exibindo dados de exemplo.';

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
        summaryText={summaryText}
      />

      {/* Container de Desempenho com Gráfico */}
      <PerformanceChartContainer
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        performanceData={performanceDataToUse}
        metricOptions={metricOptions}
        insightText={insightsText}
      />

      {/* Container da Tabela de Equalizações */}
      <EqualizationTableContainer collaboratorsData={collaboratorsToUse} />
    </div>
  );
};

export default ManagerBrutalFacts;
