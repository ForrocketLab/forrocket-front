import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManagerService from '../../../services/ManagerService';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { TabItem } from './components/TabNavigation';
import EvaluationHeader from './components/CollaboratorEvaluationHeader';
import PostureCriteriaList from './components/EvaluationCriteriaList';
import ExecutionCriteriaList from './components/ExecutionCriteriaList';
import ManagerEvaluationsHistory from './ManagerEvaluationsHistory';
import ClientEvaluation from '../collaborators/components/ClientEvaluation';
import type { DetailedSelfAssessment } from '../../../types/detailedEvaluations';
import { POSTURE_CRITERIA_IDS, EXECUTION_CRITERIA_IDS, criteriaNames } from '../../../config/evaluationCriteria';

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

const TABS: TabItem[] = [
  { id: 'evaluation', label: 'Avaliação' },
  { id: 'history', label: 'Histórico' },
  { id: 'customer', label: 'Avaliação do Cliente' },
];

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useGlobalToast();

  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryDto | null>(null);
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorJobTitle, setCollaboratorJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerAssessments, setManagerAssessments] = useState<Record<string, ManagerCriterionState>>({});
  const [IsCollaboratorSelfAssessmentSubmitted, setIsCollaboratorSelfAssessmentSubmitted] = useState(false);
  const [isManagerAssessmentSubmitted, setIsManagerAssessmentSubmitted] = useState(false);

  const [managerOwnAssessment, setManagerOwnAssessment] = useState<ManagerAssessmentData | null>(null);

  const [activeTab, setActiveTab] = useState('evaluation');

  useEffect(() => {
    if (!collaboratorIdFromUrl) {
      setError('ID do colaborador não foi encontrado na URL.');
      setIsLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const activeCycle: ActiveCycle = await ManagerService.getActiveCycle();

        const [selfAssessment, dashboardData, historyData, ownManagerAssessment] = await Promise.all([
          ManagerService.getDetailedSelfAssessment(collaboratorIdFromUrl),
          ManagerService.getManagerDashboard(activeCycle.name),
          ManagerService.getCollaboratorPerformanceHistory(collaboratorIdFromUrl),
          ManagerService.getManagerOwnAssessmentForSubordinate(collaboratorIdFromUrl, activeCycle.name),
        ]);

        setDetailedSelfAssessment(selfAssessment);
        setPerformanceHistory(historyData);
        setManagerOwnAssessment(ownManagerAssessment);

        if (selfAssessment?.status === 'SUBMITTED') {
          setIsCollaboratorSelfAssessmentSubmitted(true);
        } else {
          setIsCollaboratorSelfAssessmentSubmitted(false);
        }

        if (ownManagerAssessment?.status === 'SUBMITTED') {
          setIsManagerAssessmentSubmitted(true);
        } else {
          setIsManagerAssessmentSubmitted(false);
        }

        if (ownManagerAssessment) {
          const initialManagerAssessments: Record<string, ManagerCriterionState> = {};
          ownManagerAssessment.answers.forEach(answer => {
            initialManagerAssessments[answer.criterionId] = {
              score: answer.score,
              justification: answer.justification,
            };
          });
          setManagerAssessments(initialManagerAssessments);
        }


        const subordinates =
          dashboardData?.collaboratorsInfo?.flatMap((group: DashboardProjectGroup) => group.subordinates) ?? [];
        const foundCollaborator = subordinates.find((sub: DashboardSubordinate) => sub.id === collaboratorIdFromUrl);
        if (foundCollaborator) {
          setCollaboratorName(foundCollaborator.name);
          setCollaboratorJobTitle(foundCollaborator.jobTitle);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar os dados necessários.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [collaboratorIdFromUrl]);

  const handleManagerRatingChange = (criterionId: string, score: number) => {
    if (isManagerAssessmentSubmitted) return;
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score, justification: prev[criterionId]?.justification ?? '' },
    }));
  };
  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    if (isManagerAssessmentSubmitted) return;
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification, score: prev[criterionId]?.score ?? 0 },
    }));
  };

  const handleSubmitManagerAssessment = async () => {
    if (isManagerAssessmentSubmitted) return;

    const allCriteria = [...POSTURE_CRITERIA_IDS, ...EXECUTION_CRITERIA_IDS];
    const completedCount = allCriteria.filter(
      id => (managerAssessments[id]?.score ?? 0) > 0 && (managerAssessments[id]?.justification ?? '').trim() !== '',
    ).length;

    if (completedCount < allCriteria.length) {
      toast.error('Erro de Validação', 'Por favor, preencha a nota e a justificativa para todos os critérios.');
      return;
    }

    setIsLoading(true);
    toast.info('Aguarde', 'A enviar a sua avaliação...');

    const payloadToSend: Record<string, any> = {
      evaluatedUserId: collaboratorIdFromUrl,
      cycle: detailedSelfAssessment?.cycle || '2025.1',
    };

    allCriteria.forEach(criterionId => {
      const formattedCriterionIdForBackend = criterionId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

      payloadToSend[`${formattedCriterionIdForBackend}Score`] = managerAssessments[criterionId].score;
      payloadToSend[`${formattedCriterionIdForBackend}Justification`] = managerAssessments[criterionId].justification;
    });

    try {
      await ManagerService.submitManagerSubordinateAssessment(payloadToSend as any);
      toast.success('Sucesso', 'Avaliação enviada e salva com sucesso!');

      setIsManagerAssessmentSubmitted(true);
      setIsLoading(false);

      setTimeout(() => {
        navigate('/manager/collaborators');
      }, 1500);
    } catch (submitError) {
      toast.error(
        'Falha na Submissão',
        submitError instanceof Error ? submitError.message : 'Ocorreu um erro desconhecido.',
      );
      setIsLoading(false);
      setIsManagerAssessmentSubmitted(false);
    }
  };

  const getCriterionName = (id: string) => {
    return criteriaNames[id] || id;
  };

  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set());
  const toggleCriterionExpansion = (id: string) => {
    const newSet = new Set(expandedCriterion);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedCriterion(newSet);
  };

  if (isLoading) {
    return (
      <div className='p-8 text-center'>
        Carregando...
      </div>
    );
  }
  if (error) {
    return (
      <div className='p-8 text-center text-red-500'>
        Erro: {error}
      </div>
    );
  }
  if (!detailedSelfAssessment) {
    return (
      <div className='p-8 text-center'>
        Autoavaliação não encontrada.
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <EvaluationHeader
        isAssessmentSubmitted={isManagerAssessmentSubmitted}
        collaboratorName={collaboratorName}
        collaboratorInitials={collaboratorName
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)}
        collaboratorJobTitle={collaboratorJobTitle}
        onSubmit={handleSubmitManagerAssessment}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className='px-6 p-4 md:p-8'>
        {activeTab === 'evaluation' && (
          <>
            <PostureCriteriaList
              isAssessmentSubmitted={isManagerAssessmentSubmitted}
              answers={detailedSelfAssessment.answers}
              managerAssessments={managerAssessments}
              expandedCriterion={expandedCriterion}
              completion={{
                completed: POSTURE_CRITERIA_IDS.filter(
                  id => (managerAssessments[id]?.score ?? 0) > 0 && (managerAssessments[id]?.justification ?? '').trim() !== '',
                ).length,
                total: POSTURE_CRITERIA_IDS.length,
              }}
              getCriterionName={getCriterionName}
              onToggleExpansion={toggleCriterionExpansion}
              onRatingChange={handleManagerRatingChange}
              onJustificationChange={handleManagerJustificationChange}
            />

            <ExecutionCriteriaList
              isAssessmentSubmitted={isManagerAssessmentSubmitted}
              answers={detailedSelfAssessment.answers}
              managerAssessments={managerAssessments}
              expandedCriterion={expandedCriterion}
              completion={{
                completed: EXECUTION_CRITERIA_IDS.filter(
                  id => (managerAssessments[id]?.score ?? 0) > 0 && (managerAssessments[id]?.justification ?? '').trim() !== '',
                ).length,
                total: EXECUTION_CRITERIA_IDS.length,
              }}
              getCriterionName={getCriterionName}
              onToggleExpansion={toggleCriterionExpansion}
              onRatingChange={handleManagerRatingChange}
              onJustificationChange={handleManagerJustificationChange}
            />
          </>
        )}
        {activeTab === 'history' && performanceHistory && (
          <ManagerEvaluationsHistory performanceHistory={performanceHistory} />
        )}
        {activeTab === 'customer' && collaboratorIdFromUrl && performanceHistory && (
          <ClientEvaluation collaboratorId={collaboratorIdFromUrl} performanceHistory={performanceHistory} />
        )}
      </main>
    </div>
  );
};

export default CollaboratorEvaluationDetails;