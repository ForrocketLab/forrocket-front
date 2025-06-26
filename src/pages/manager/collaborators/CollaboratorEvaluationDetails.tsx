import { type FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import DashboardService from '../../../services/ManagerService';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { TabItem } from '../collaboratorEvaluations/components/TabNavigation';
import EvaluationHeader from './components/CollaboratorEvaluationHeader';
import EvaluationCriteriaList from './components/EvaluationCriteriaList';
import Manager360Evaluations from './Manager360Evaluations';
import ManagerEvaluationsHistory from './ManagerEvaluationsHistory';

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

export const ALLOWED_CRITERIA_IDS = [
  'sentimento-de-dono',
  'resiliencia-adversidades',
  'organizacao-trabalho',
  'capacidade-aprender',
  'team-player',
];

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const toast = useGlobalToast();

  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null);
  const [activeCycleName, setActiveCycleName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set());

  const [collaboratorName, setCollaboratorName] = useState('Colaborador Avaliado');
  const [collaboratorJobTitle, setCollaboratorJobTitle] = useState('Cargo do Colaborador');

  const [managerAssessments, setManagerAssessments] = useState<Record<string, ManagerCriterionState>>({});

  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);

  const [activeTab, setActiveTab] = useState('evaluation');

  const TABS: TabItem[] = [
    { id: 'evaluation', label: 'Avaliação' },
    { id: '360-evaluation', label: 'Avaliação 360' },
    { id: 'history', label: 'Histórico' },
  ];

  useEffect(() => {
    if (!collaboratorIdFromUrl) {
      setError('ID do colaborador não fornecido na URL.');
      setIsLoading(false);
      return;
    }

    const fetchAssessmentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const activeCycle = await DashboardService.getActiveCycle();
        setActiveCycleName(activeCycle.name);

        const selfAssessment = await DashboardService.getDetailedSelfAssessment(collaboratorIdFromUrl);
        setDetailedSelfAssessment(selfAssessment);

        const dashboardData = await DashboardService.getManagerDashboard(activeCycle.name);
        const foundCollaborator = dashboardData.collaboratorsInfo
          .flatMap(group => group.subordinates)
          .find(sub => sub.id === collaboratorIdFromUrl);

        if (foundCollaborator) {
          setCollaboratorName(foundCollaborator.name);
          setCollaboratorJobTitle(foundCollaborator.jobTitle);
        } else {
          setCollaboratorName('Colaborador Desconhecido');
          setCollaboratorJobTitle('Cargo Desconhecido');
        }

        const fullEvaluation = await DashboardService.getCollaboratorFullEvaluation(
          collaboratorIdFromUrl,
          activeCycle.name,
        );

        const initialManagerAssessments: Record<string, ManagerCriterionState> = {};

        if (fullEvaluation.managerAssessments && fullEvaluation.managerAssessments.length > 0) {
          const managerExistingAssessment = fullEvaluation.managerAssessments[0];
          managerExistingAssessment.answers.forEach(answer => {
            if (ALLOWED_CRITERIA_IDS.includes(answer.criterionId)) {
              initialManagerAssessments[answer.criterionId] = {
                score: answer.score,
                justification: answer.justification,
              };
            }
          });
        }

        ALLOWED_CRITERIA_IDS.forEach(criterionId => {
          if (!initialManagerAssessments[criterionId]) {
            initialManagerAssessments[criterionId] = { score: 0, justification: '' };
          }
        });

        setManagerAssessments(initialManagerAssessments);

        const isSubmitted = ALLOWED_CRITERIA_IDS.every(criterionId => {
          const assessment = initialManagerAssessments[criterionId];
          return assessment && assessment.score >= 1 && assessment.score <= 5 && assessment.justification.trim() !== '';
        });
        setIsAssessmentSubmitted(isSubmitted);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados de avaliação.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [collaboratorIdFromUrl]);

  const handleManagerRatingChange = (criterionId: string, score: number) => {
    if (isAssessmentSubmitted) return;
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score },
    }));
  };

  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    if (isAssessmentSubmitted) return;
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification },
    }));
  };

  const getManagerCompletionCount = () => {
    const total = ALLOWED_CRITERIA_IDS.length;
    const completed =
      ALLOWED_CRITERIA_IDS.filter(criterionId => {
        const managerAssessment = managerAssessments[criterionId];
        return (
          managerAssessment &&
          managerAssessment.score >= 1 &&
          managerAssessment.score <= 5 &&
          managerAssessment.justification.trim() !== ''
        );
      }).length || 0;

    return { completed, total };
  };

  const handleSubmitManagerAssessment = async () => {
    if (!collaboratorIdFromUrl) {
      toast.error('Erro', 'ID do colaborador não disponível para submeter a avaliação.');
      return;
    }

    if (!detailedSelfAssessment || !activeCycleName) {
      toast.error('Erro', 'Dados incompletos para submeter a avaliação.');
      return;
    }

    const { completed, total } = getManagerCompletionCount();

    if (completed < total) {
      toast.warning('Avaliação Incompleta', 'Por favor, avalie e justifique cada critério com uma nota de 1 a 5.');
      return;
    }

    const payloadToSend: Record<string, any> = {
      evaluatedUserId: collaboratorIdFromUrl,
    };

    ALLOWED_CRITERIA_IDS.forEach(criterionId => {
      const camelCaseCriterion = criterionId.replace(/-([a-z])/g, g => g[1].toUpperCase());
      const managerAssessment = managerAssessments[criterionId];
      if (managerAssessment) {
        payloadToSend[`${camelCaseCriterion}Score`] = managerAssessment.score;
        payloadToSend[`${camelCaseCriterion}Justification`] = managerAssessment.justification;
      }
    });

    try {
      await DashboardService.submitManagerSubordinateAssessment(payloadToSend as any);
      toast.success('Sucesso', 'Avaliação do gestor enviada com sucesso!');
      setIsAssessmentSubmitted(true);
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Falha ao enviar avaliação.';
      toast.error('Erro', msg);
    }
  };

  const { completed, total } = getManagerCompletionCount();

  const toggleCriterionExpansion = (criterionId: string) => {
    setExpandedCriterion(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(criterionId)) {
        newSet.delete(criterionId);
      } else {
        newSet.add(criterionId);
      }
      return newSet;
    });
  };

  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600'></div>
        <p className='ml-4 text-gray-700'>Carregando dados de avaliação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar dados</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors'
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!detailedSelfAssessment) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Dados de autoavaliação não encontrados</h3>
            <p className='text-gray-600 mb-4'>
              Verifique se o colaborador possui uma autoavaliação para o ciclo atual.
            </p>
            <button
              onClick={() => window.history.back()}
              className='bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors'
            >
              Voltar para Colaboradores
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCriterionName = (criterionId: string): string => {
    const map: Record<string, string> = {
      'sentimento-de-dono': 'Sentimento de Dono',
      'resiliencia-adversidades': 'Resiliência nas Adversidades',
      'organizacao-trabalho': 'Organização no Trabalho',
      'capacidade-aprender': 'Capacidade de Aprender',
      'team-player': 'Ser "Team Player"',
    };
    return map[criterionId] || criterionId;
  };

  const collaboratorInitials = getInitials(collaboratorName);

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='flex flex-col flex-1'>
        <EvaluationHeader
          isAssessmentSubmitted
          collaboratorName={collaboratorName}
          collaboratorInitials={collaboratorInitials}
          collaboratorJobTitle={collaboratorJobTitle}
          onSubmit={handleSubmitManagerAssessment}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className='flex-1 pt-28 pb-8'>
          {activeTab === 'evaluation' && detailedSelfAssessment && (
            <EvaluationCriteriaList
              isAssessmentSubmitted
              answers={detailedSelfAssessment.answers}
              managerAssessments={managerAssessments}
              expandedCriterion={expandedCriterion}
              completion={{ completed, total }}
              getCriterionName={getCriterionName}
              onToggleExpansion={toggleCriterionExpansion}
              onRatingChange={handleManagerRatingChange}
              onJustificationChange={handleManagerJustificationChange}
            />
          )}
          {activeTab === '360-evaluation' && <Manager360Evaluations />}
          {activeTab === 'history' && <ManagerEvaluationsHistory />}
        </main>
      </div>
    </div>
  );
};

export default CollaboratorEvaluationDetails;
