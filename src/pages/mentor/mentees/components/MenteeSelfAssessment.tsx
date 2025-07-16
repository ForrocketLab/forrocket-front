import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertTriangle, FileX } from 'lucide-react';
import EvaluationService from '../../../../services/EvaluationService';
import MentorService, { MenteeSelfAssessment as MenteeSelfAssessmentData } from '../../../../services/MentorService';
import { ReadonlyStarRating } from '../../../../components/ReadonlyStarRating';

interface CriteriaGroup {
  id: string;
  name: string;
  description: string;
  pillar: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight: number;
  isRequired: boolean;
}

const ReadonlyPillarSection = ({
  title,
  children,
  criteria,
  assessmentMap,
}: {
  title: string;
  children: React.ReactNode;
  criteria: CriteriaGroup[];
  assessmentMap: Record<string, { score: number; justification: string }>;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Calcular estatísticas do pilar
  const completedCriteria = criteria.filter(c => {
    const assessment = assessmentMap[c.id];
    return assessment && assessment.score > 0 && assessment.justification.trim() !== '';
  }).length;

  const averageRating =
    completedCriteria > 0
      ? criteria
          .filter(c => {
            const assessment = assessmentMap[c.id];
            return assessment && assessment.score > 0 && assessment.justification.trim() !== '';
          })
          .reduce((sum, c) => sum + assessmentMap[c.id].score, 0) / completedCriteria
      : 0;

  const progressPercentage = criteria.length > 0 ? (completedCriteria / criteria.length) * 100 : 0;

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
      <div onClick={() => setIsOpen(!isOpen)} className='cursor-pointer hover:bg-gray-50 transition-colors p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {isOpen ? (
              <ChevronDown className='h-5 w-5 text-gray-500' />
            ) : (
              <ChevronRight className='h-5 w-5 text-gray-500' />
            )}
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div className='text-2xl font-bold text-[#08605F]'>
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </div>
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                {completedCriteria}/{criteria.length} preenchidos
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className='px-4 pb-4 mt-2 space-y-4'>{children}</div>}
    </div>
  );
};

const MenteeSelfAssessment = () => {
  const { id: menteeId } = useParams<{ id: string }>();
  const [selfAssessmentData, setSelfAssessmentData] = useState<MenteeSelfAssessmentData | null>(null);
  const [criteria, setCriteria] = useState<CriteriaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!menteeId) {
        setError('ID do mentorado não fornecido');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const criteriaData = await EvaluationService.getCriteria();
        setCriteria(criteriaData);
        const activeCycle = await MentorService.getActiveCycle();
        if (!activeCycle || !activeCycle.id) {
          throw new Error('Nenhum ciclo ativo encontrado');
        }
        const assessmentData = await MentorService.getMenteeSelfAssessment(menteeId, activeCycle.id);
        setSelfAssessmentData(assessmentData);
      } catch (error) {
        console.error('Erro ao carregar autoavaliação do mentee:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Não foi possível carregar a autoavaliação do mentorado';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [menteeId]);

  // Mapear respostas da avaliação
  const selfAssessmentMap =
    selfAssessmentData?.answers?.reduce(
      (acc, answer) => {
        acc[answer.criterionId] = {
          score: answer.score,
          justification: answer.justification,
        };
        return acc;
      },
      {} as Record<string, { score: number; justification: string }>,
    ) || {};

  // Filtrar critérios apenas para aqueles que têm respostas
  const availableCriteriaIds = Object.keys(selfAssessmentMap);
  const filteredCriteria = criteria.filter(criterion => availableCriteriaIds.includes(criterion.id));

  // Agrupar critérios por pilar
  const groupedCriteria = filteredCriteria.reduce(
    (acc, criterion) => {
      if (criterion?.pillar) {
        if (!acc[criterion.pillar]) {
          acc[criterion.pillar] = [];
        }
        acc[criterion.pillar].push(criterion);
      }
      return acc;
    },
    {} as Record<string, CriteriaGroup[]>,
  );

  const pillarNames = {
    BEHAVIOR: 'Comportamento',
    EXECUTION: 'Execução',
    MANAGEMENT: 'Gestão',
  };

  // --- Estados de Carregamento e Erro com a nova estilização ---
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#08605F] mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando autoavaliação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-sm text-center'>
        <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>Erro ao Carregar</h3>
        <p className='text-gray-600'>{error}</p>
      </div>
    );
  }

  if (!selfAssessmentData || !selfAssessmentData.answers || !Array.isArray(selfAssessmentData.answers)) {
    return (
      <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-sm text-center'>
        <FileX className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>Autoavaliação Indisponível</h3>
        <p className='text-gray-600'>
          {selfAssessmentData?.answers ? 'Os dados da avaliação são inválidos.' : 'O mentorado ainda não preencheu.'}
        </p>
      </div>
    );
  }

  // --- Renderização do componente com a nova estilização ---
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl'>
        {/* Pilares e Critérios */}
        <div className='space-y-6'>
          {Object.entries(groupedCriteria).map(([pillar, pillarCriteria]) => {
            if (!pillarCriteria?.length) return null;

            return (
              <ReadonlyPillarSection
                key={pillar}
                title={pillarNames[pillar as keyof typeof pillarNames]}
                criteria={pillarCriteria}
                assessmentMap={selfAssessmentMap}
              >
                {pillarCriteria.map(criterion => {
                  const assessment = selfAssessmentMap[criterion.id] || { score: 0, justification: '' };

                  return (
                    <div
                      key={criterion.id}
                      className='bg-white border border-gray-200 rounded-lg border-l-4 border-l-[#08605F]/20 shadow-sm p-4'
                    >
                      {/* Header do Critério */}
                      <div className='flex items-start justify-between gap-4 mb-4'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900'>{criterion.name}</h4>
                          <p className='text-sm text-gray-600 mt-1'>{criterion.description}</p>
                        </div>
                        <div className='flex items-center gap-3 pt-1'>
                          <ReadonlyStarRating rating={assessment.score} />
                          <span className='text-lg font-bold text-[#08605F] min-w-[3rem] text-center'>
                            {assessment.score > 0 ? assessment.score.toFixed(1) : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Justificativa */}
                      <div>
                        <label className='text-sm font-medium text-gray-700 block mb-2'>
                          Justificativa do Mentorado (a)
                        </label>
                        <textarea
                          value={assessment.justification}
                          disabled
                          className='w-full min-h-[80px] resize-none p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 cursor-not-allowed outline-none'
                          placeholder='Nenhuma justificativa fornecida.'
                        />
                      </div>
                    </div>
                  );
                })}
              </ReadonlyPillarSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenteeSelfAssessment;
