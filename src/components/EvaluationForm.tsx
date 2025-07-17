import { useState, useEffect, useMemo } from 'react';
import { Criteria, PillarSection } from './PillarSection';
import { useEvaluation } from '../hooks/useEvaluation';
import EvaluationService, { type CriteriaDto } from '../services/EvaluationService';

interface Pillar {
  id: string;
  title: string;
  description: string;
  criteria: Criteria[];
}

// Interface para o componente pai acessar os dados
export interface SelfAssessmentData {
  [criterioId: string]: {
    score: number;
    justification: string;
  };
}

interface EvaluationFormProps {
  isReadOnly?: boolean;
}

const EvaluationForm = ({ isReadOnly = false }: EvaluationFormProps) => {
  // Removido useState de pillars, pois agora é derivado do contexto
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useEvaluation();

  const [criteriaCache, setCriteriaCache] = useState<CriteriaDto[]>([]);
  // Derivar pilares a partir do contexto
  const pillars = useMemo(() => {
    // Função para mapear critérios da API para o formato do componente (dinâmico)
    const mapCriteriaToComponent = (
      apiCriteria: CriteriaDto[],
      existingAssessment?: Record<string, { score: number; justification: string }> | null,
    ): Pillar[] => {
      // Criar um map dinâmico baseado nos pilares que vêm da API
      const pillarMap: Record<string, { title: string; description: string; criteria: Criteria[] }> = {};

      // Primeiro, identificar todos os pilares únicos
      const uniquePillars = [...new Set(apiCriteria.map(c => c.pillar))];

      // Criar definições dinâmicas para cada pilar
      uniquePillars.forEach(pillar => {
        const pillarTitles: Record<string, string> = {
          BEHAVIOR: 'Comportamento',
          EXECUTION: 'Execução',
          MANAGEMENT: 'Gestão',
        };

        const pillarDescriptions: Record<string, string> = {
          BEHAVIOR: 'Avalia competências comportamentais e atitudinais fundamentais',
          EXECUTION: 'Avalia a capacidade de entregar resultados com qualidade e dentro dos prazos',
          MANAGEMENT: 'Capacidade de liderança e gestão estratégica',
        };

        pillarMap[pillar] = {
          title: pillarTitles[pillar] || pillar,
          description: pillarDescriptions[pillar] || `Critérios de ${pillar}`,
          criteria: [],
        };
      });

      // Agrupar critérios por pilar
      apiCriteria.forEach(criterion => {
        if (pillarMap[criterion.pillar]) {
          // Buscar dados existentes para este critério - primeiro do contexto, depois do backend
          const contextData = state.selfAssessment[criterion.id];
          const existingData = contextData || existingAssessment?.[criterion.id];

          pillarMap[criterion.pillar].criteria.push({
            id: criterion.id,
            title: criterion.name,
            description: criterion.description,
            rating: existingData?.score || 0,
            justification: existingData?.justification || '',
          });
        }
      });

      // Converter para array de Pillar
      return Object.entries(pillarMap)
        .map(([pillarId, pillar]) => ({
          id: pillarId.toLowerCase(),
          title: pillar.title,
          description: pillar.description,
          criteria: pillar.criteria,
        }))
        .filter(pillar => pillar.criteria.length > 0);
    };

    if (Object.keys(state.selfAssessment).length > 0 && criteriaCache.length > 0) {
      return mapCriteriaToComponent(criteriaCache, state.selfAssessment);
    }
    return [];
  }, [state.selfAssessment, criteriaCache]);

  // Carregar critérios da API e avaliação existente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Carregar critérios
        const apiCriteria = await EvaluationService.getCriteria();
        setCriteriaCache(apiCriteria);
        // Carregar avaliação existente (se houver) apenas se não há dados no contexto
        let existingAssessment = null;
        if (Object.keys(state.selfAssessment).length === 0) {
          existingAssessment = await EvaluationService.getSelfAssessment();
          if (existingAssessment) {
            dispatch({ type: 'SET_SELF_ASSESSMENT', payload: existingAssessment });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    // Se já tem dados no contexto, monta a UI a partir deles
    if (Object.keys(state.selfAssessment).length > 0 && criteriaCache.length > 0) {
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, []);

  const handleCriteriaUpdate = (_pillarId: string, criteriaId: string, updates: Partial<Criteria>) => {
    // Atualizar o contexto global - sempre atualizar com valores seguros
    const currentData = state.selfAssessment[criteriaId] || { score: 0, justification: '' };

    dispatch({
      type: 'UPDATE_SELF_ASSESSMENT',
      payload: {
        criterionId: criteriaId,
        score: updates.rating !== undefined ? updates.rating : currentData.score,
        justification: updates.justification !== undefined ? updates.justification : currentData.justification,
      },
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#08605F] mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando critérios...</p>
        </div>
      </div>
    );
  }
  //<Send className='h-4 w-4' />
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-6 py-6'>
        {/* Progress Overview */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-semibold text-gray-900'>Critérios de Avaliação</h2>
            </div>
            <div className='flex items-center gap-4'>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700'>
                {/* completedCriteria e totalCriteria devem ser recalculados a partir de pillars */}
                {pillars.reduce(
                  (sum, pillar) =>
                    sum + pillar.criteria.filter(c => c.rating > 0 && c.justification.trim() !== '').length,
                  0,
                )}
                /{pillars.reduce((sum, pillar) => sum + pillar.criteria.length, 0)} preenchidos
              </span>
              <span className='text-2xl font-bold text-[#08605F]'>
                {(() => {
                  const total = pillars.reduce((sum, pillar) => sum + pillar.criteria.length, 0);
                  const completed = pillars.reduce(
                    (sum, pillar) =>
                      sum + pillar.criteria.filter(c => c.rating > 0 && c.justification.trim() !== '').length,
                    0,
                  );
                  return total > 0 ? ((completed / total) * 100).toFixed(0) : '0';
                })()}
                %
              </span>
            </div>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-[#08605F] h-3 rounded-full transition-all duration-500'
              style={{
                width: `${(() => {
                  const total = pillars.reduce((sum, pillar) => sum + pillar.criteria.length, 0);
                  const completed = pillars.reduce(
                    (sum, pillar) =>
                      sum + pillar.criteria.filter(c => c.rating > 0 && c.justification.trim() !== '').length,
                    0,
                  );
                  return total > 0 ? (completed / total) * 100 : 0;
                })()}%`,
              }}
            />
          </div>
          <p className='text-sm text-gray-600 mt-2'>Complete sua avaliação preenchendo todos os critérios abaixo</p>
        </div>
        {/* Pillars */}
        <div className='space-y-4'>
          {pillars.map((pillar, index) => (
            <PillarSection
              key={pillar.id}
              id={pillar.id}
              title={pillar.title}
              description={pillar.description}
              criteria={pillar.criteria}
              onCriteriaUpdate={(criteriaId, updates) => handleCriteriaUpdate(pillar.id, criteriaId, updates)}
              defaultOpen={index === 0}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;
