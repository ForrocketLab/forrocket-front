import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import PersonalInsightsCard from '../../../../components/cards/PersonalInsightsCard';
import { useAuth } from '../../../../hooks/useAuth';

interface CycleEvaluationCardProps {
  cycle: string;
  selfScore: {
    BEHAVIOR: number | null;
    EXECUTION: number | null;
    MANAGEMENT: number | null;
  };
  managerScore: {
    BEHAVIOR: number | null;
    EXECUTION: number | null;
    MANAGEMENT: number | null;
  };
  finalScore: number | null;
  assessments360Mean: number | null;
}

const CycleEvaluationCard = ({
  cycle,
  selfScore,
  managerScore,
  finalScore,
  assessments360Mean,
}: CycleEvaluationCardProps) => {
  const { user } = useAuth();
  const [showInsights, setShowInsights] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Considera completo se há nota final OU se há avaliações do gestor
  const hasEvaluationData =
    finalScore !== null ||
    (managerScore?.EXECUTION !== null && managerScore?.BEHAVIOR !== null) ||
    (selfScore?.EXECUTION !== null && selfScore?.BEHAVIOR !== null);

  // Considera concluído quando há nota final do comitê (equalização)
  const isComplete = finalScore !== null;

  const status = isComplete ? 'Concluído' : 'Em andamento';

  const selfScoreAverage =
    selfScore?.BEHAVIOR && selfScore?.EXECUTION && selfScore?.MANAGEMENT
      ? (selfScore.BEHAVIOR + selfScore.EXECUTION + selfScore.MANAGEMENT) / 3
      : null;

  const toggleInsights = () => {
    setShowInsights(prev => !prev);
  };

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className='bg-white rounded-xl shadow-md border border-gray-200 w-full mb-6'>
      {/* Cabeçalho do Ciclo - Sempre Visível */}
      <div
        className='flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={toggleExpanded}
      >
        <div className='flex items-center gap-4'>
          <h3 className='text-lg font-bold text-gray-800'>{cycle}</h3>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>Nota</span>
            <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
              {finalScore ? finalScore.toFixed(2) : '-'}
            </div>
          </div>
          <button className='text-gray-400 hover:text-gray-600'>
            {isExpanded ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
          </button>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className='px-6 pb-6 border-t border-gray-100'>
          <div className='pt-6'>
            {/* Botão para mostrar/ocultar Insights IA */}
            {hasEvaluationData && user && (
              <div className='mb-6 flex justify-between items-center'>
                <h4 className='text-lg font-semibold text-gray-900'>Insights Personalizados</h4>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleInsights();
                  }}
                  className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm'
                >
                  <Brain className='w-4 h-4' />
                  {showInsights ? 'Ocultar Insights' : '🧠 Análise Inteligente'}
                </button>
              </div>
            )}

            {/* Componente Insights IA */}
            {showInsights && hasEvaluationData && user && (
              <div className='mb-6'>
                <PersonalInsightsCard collaboratorId={user.id} collaboratorName={user.name} cycle={cycle} />
              </div>
            )}

            {/* Barras de Progresso */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm text-gray-600'>Autoavaliação</span>
                  <span className='text-sm font-medium text-[#24A19F]'>{selfScoreAverage?.toFixed(2) || '-'}</span>
                </div>
                <div className='h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-2 bg-[#24A19F] rounded-full transition-all duration-300'
                    style={{ width: `${selfScoreAverage ? (selfScoreAverage / 5) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm text-gray-600'>Avaliação do Gestor - Execução</span>
                  <span className='text-sm font-medium text-[#419958]'>
                    {managerScore?.EXECUTION ? managerScore.EXECUTION.toFixed(2) : '-'}
                  </span>
                </div>
                <div className='h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-2 bg-[#419958] rounded-full transition-all duration-300'
                    style={{ width: `${managerScore?.EXECUTION ? (managerScore.EXECUTION / 5) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm text-gray-600'>Avaliação do Gestor - Postura</span>
                  <span className='text-sm font-medium text-[#F5B030]'>
                    {managerScore?.BEHAVIOR ? managerScore.BEHAVIOR.toFixed(2) : '-'}
                  </span>
                </div>
                <div className='h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-2 bg-[#F5B030] rounded-full transition-all duration-300'
                    style={{ width: `${managerScore?.BEHAVIOR ? (managerScore.BEHAVIOR / 5) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm text-gray-600'>Média do 360</span>
                  <span className='text-sm font-medium text-[#8B5CF6]'>
                    {assessments360Mean ? assessments360Mean.toFixed(2) : '-'}
                  </span>
                </div>
                <div className='h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-2 bg-[#8B5CF6] rounded-full transition-all duration-300'
                    style={{ width: `${assessments360Mean ? (assessments360Mean / 5) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status ou informações adicionais */}
            {!hasEvaluationData ? (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='text-md font-medium text-gray-700 mb-2'>📝 Status</h4>
                <p className='text-sm text-gray-600'>Ainda não há avaliações disponíveis para este ciclo.</p>
              </div>
            ) : (
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                    <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='text-sm'>
                    <span className='text-gray-600'>Ciclo </span>
                    <span className='font-semibold text-green-700'>{cycle}</span>
                    <span className='text-gray-600'> - {status}</span>
                    {finalScore && (
                      <>
                        <span className='text-gray-600'> com nota final </span>
                        <span className='font-semibold text-green-700'>{finalScore.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleEvaluationCard;
