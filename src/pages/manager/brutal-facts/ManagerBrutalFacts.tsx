import { LuFilePenLine } from 'react-icons/lu';
import BaseCard from '../dashboard/components/BaseCard';
import DetailedScoreCard from '../dashboard/components/DetailedScoreCard';
import BrutalFactsHeader from './components/BrutalFactsHeader';
import BrutalFactsSummary from './components/BrutalFactsSummary';
import PerformanceChartContainer from './components/PerformanceChartContainer';
import EqualizationTableContainer from './components/EqualizationTableContainer';
import { FaSortAmountUp, FaStar } from 'react-icons/fa';
import { useState } from 'react';

const ManagerBrutalFacts = () => {
  const [selectedMetric, setSelectedMetric] = useState('finalScore');

  // Opções para o filtro do gráfico
  const metricOptions = [
    { value: 'finalScore', label: 'Nota Final' },
    { value: 'selfScore', label: 'Autoavaliação' },
    { value: 'managerScore', label: 'Avaliação do Gestor' },
  ];

  // Dados mockados para o gráfico
  const mockPerformanceData = [
    { cycle: '2023.1', finalScore: 3.8, selfScore: 3.5, managerScore: 4.1 },
    { cycle: '2023.2', finalScore: 4.2, selfScore: 4.0, managerScore: 4.4 },
    { cycle: '2024.1', finalScore: 4.0, selfScore: 3.8, managerScore: 4.2 },
    { cycle: '2024.2', finalScore: 4.5, selfScore: 4.3, managerScore: 4.7 },
  ];

  // Dados mockados para a tabela de equalizações
  const mockCollaboratorsData = [
    {
      id: '1',
      initials: 'JD',
      name: 'João Silva',
      jobTitle: 'Desenvolvedor Senior',
      selfAssessmentScore: 4.2,
      evaluation360Score: 4.0,
      managerScore: 4.5,
      finalScore: 4.3,
      finalScoreColor: 'green' as const,
      status: 'high',
    },
    {
      id: '2',
      initials: 'MS',
      name: 'Maria Santos',
      jobTitle: 'Product Manager',
      selfAssessmentScore: 3.8,
      evaluation360Score: 4.1,
      managerScore: 3.9,
      finalScore: 3.9,
      finalScoreColor: 'teal' as const,
      status: 'medium',
    },
    {
      id: '3',
      initials: 'PC',
      name: 'Pedro Costa',
      jobTitle: 'Designer UX/UI',
      selfAssessmentScore: 3.5,
      evaluation360Score: 3.2,
      managerScore: 3.4,
      finalScore: 3.4,
      finalScoreColor: 'yellow' as const,
      status: 'low',
    },
    {
      id: '4',
      initials: 'AL',
      name: 'Ana Lima',
      jobTitle: 'Analista de Dados',
      selfAssessmentScore: 4.5,
      evaluation360Score: 4.3,
      managerScore: 4.6,
      finalScore: 4.5,
      finalScoreColor: 'green' as const,
      status: 'high',
    },
  ];

  const handleDownload = () => {
    // TODO: Implementar lógica de download dos brutal facts
    console.log('Download dos brutal facts iniciado');
  };

  return (
    <div className='h-screen flex flex-col'>
      {/* Header */}
      <BrutalFactsHeader onToggleDownload={handleDownload} />

      {/* Cards de resumo */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 pt-8'>
        <DetailedScoreCard
          title='Nota média geral'
          description={`Em comparação ao ciclo 2024.1.`}
          score={5}
          ratingText={'Great'}
          color='#419958'
          icon={<FaStar size={32} />}
        />
        <BaseCard
          title={'Desempenho de liderados'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#F5AA30' }}></div>
              <p className='text-sm text-gray-600 font-normal'>{'Crescimento de +0.3 comparação ao ciclo 2024.1'}</p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#F5AA30' }}>{<FaSortAmountUp size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#F5AA30' }}>
                  {0.2}
                </span>
              </div>
            </div>
          }
        />
        <BaseCard
          title={'Líderes avaliados'}
          leftContent={
            <div className='flex items-start'>
              <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: '#08605F' }}></div>
              <p className='text-sm text-gray-600 font-normal'>
                {'Foram avaliados 10 colaboradores liderados por você'}
              </p>
            </div>
          }
          rightContent={
            <div className='flex items-center justify-end gap-3'>
              <div style={{ color: '#08605F' }}>{<LuFilePenLine size={44} />}</div>
              <div className='flex flex-col text-right'>
                <span className='text-2xl font-bold' style={{ color: '#08605F' }}>
                  {10}
                </span>
              </div>
            </div>
          }
        />
      </div>

      {/* Container de Resumo */}
      <BrutalFactsSummary
        title='Resumo'
        summaryText='lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum'
      />

      {/* Container de Desempenho com Gráfico */}
      <PerformanceChartContainer
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        performanceData={mockPerformanceData}
        metricOptions={metricOptions}
        insightText='Os colaboradores demonstram evolução consistente nas avaliações, com destaque para o crescimento nas competências comportamentais. A média geral do time se mantém acima de 4.0, indicando alto desempenho. Recomenda-se focar no desenvolvimento de liderança e comunicação para o próximo ciclo.'
      />

      {/* Container da Tabela de Equalizações */}
      <EqualizationTableContainer collaboratorsData={mockCollaboratorsData} />
    </div>
  );
};

export default ManagerBrutalFacts;
