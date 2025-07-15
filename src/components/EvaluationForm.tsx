import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Criteria, PillarSection } from './PillarSection';
import { useGlobalToast } from '../hooks/useGlobalToast';
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

export interface EvaluationFormRef {
  getAssessmentData: () => SelfAssessmentData;
  isComplete: () => boolean;
  getAllCriteria: () => CriteriaDto[];
}

const EvaluationForm = forwardRef<EvaluationFormRef>((_, ref) => {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCriteria, setAllCriteria] = useState<CriteriaDto[]>([]);
  const [hasExistingAssessment, setHasExistingAssessment] = useState(false);
  const toast = useGlobalToast();

  // Função para gerar os dados dinâmicos da avaliação
  const generateAssessmentData = useCallback((): SelfAssessmentData => {
    const data: SelfAssessmentData = {};

    pillars.forEach(pillar => {
      pillar.criteria.forEach(criterion => {
        // Usar o ID original do critério como chave, com objeto contendo score e justification
        data[criterion.id] = {
          score: criterion.rating,
          justification: criterion.justification,
        };
      });
    });

    return data;
  }, [pillars]);

  // Verificar se todos os critérios obrigatórios estão preenchidos
  const isAssessmentComplete = (): boolean => {
    return pillars.every(pillar =>
      pillar.criteria.every(criterion => criterion.rating > 0 && criterion.justification.trim().length > 0),
    );
  };

  // Expor métodos para o componente pai
  useImperativeHandle(ref, () => ({
    getAssessmentData: () => generateAssessmentData(),
    isComplete: () => isAssessmentComplete(),
    getAllCriteria: () => allCriteria,
  }));

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
        // Buscar dados existentes para este critério
        const existingData = existingAssessment?.[criterion.id];

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

  // Carregar critérios da API e avaliação existente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar critérios
        const apiCriteria = await EvaluationService.getCriteria();
        setAllCriteria(apiCriteria);

        // Carregar avaliação existente (se houver)
        const existingAssessment = await EvaluationService.getSelfAssessment();

        // Mapear critérios para o formato do componente
        const mappedPillars = mapCriteriaToComponent(apiCriteria, existingAssessment);
        setPillars(mappedPillars);

        // Definir se há avaliação existente
        setHasExistingAssessment(!!existingAssessment);

        // Mostrar mensagem se avaliação existente foi carregada
        if (existingAssessment) {
          toast.info('Avaliação carregada', 'Seus dados anteriores foram carregados com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados', 'Não foi possível carregar os dados da avaliação.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCriteriaUpdate = (pillarId: string, criteriaId: string, updates: Partial<Criteria>) => {
    setPillars(
      prev =>
        prev?.map(pillar =>
          pillar.id === pillarId
            ? {
                ...pillar,
                criteria: pillar.criteria.map(criteria =>
                  criteria.id === criteriaId ? { ...criteria, ...updates } : criteria,
                ),
              }
            : pillar,
        ) || [],
    );
  };

  const totalCriteria = pillars.reduce((sum, pillar) => sum + pillar.criteria.length, 0);
  const completedCriteria = pillars.reduce((sum, pillar) => sum + pillar.criteria.filter(c => c.rating > 0).length, 0);
  const overallProgress = totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;

  // const handleSave = () => {
  //   toast.success('Avaliação salva', 'Sua avaliação foi salva com sucesso.');
  // };

  // const handleSubmit = () => {
  //   if (completedCriteria < totalCriteria) {
  //     toast.error('Avaliação incompleta', 'Por favor, complete todos os critérios antes de enviar.');
  //     return;
  //   }
  //   toast.success('Avaliação enviada', 'Sua avaliação foi enviada para análise.');
  // };

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
              {hasExistingAssessment && (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  Dados carregados
                </span>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700'>
                {completedCriteria}/{totalCriteria} preenchidos
              </span>
              <span className='text-2xl font-bold text-[#08605F]'>{overallProgress.toFixed(0)}%</span>
            </div>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-[#08605F] h-3 rounded-full transition-all duration-500'
              style={{ width: `${overallProgress}%` }}
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
            />
          ))}
        </div>
      </div>
    </div>
  );
});

EvaluationForm.displayName = 'EvaluationForm';

export default EvaluationForm;
