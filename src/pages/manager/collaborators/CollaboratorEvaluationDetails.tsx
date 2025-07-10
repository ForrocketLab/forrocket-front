// src/pages/manager/CollaboratorEvaluationDetails.tsx

// SEUS IMPORTS - MANTIDOS EXATAMENTE COMO ESTAVAM
import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManagerService from '../../../services/ManagerService';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { TabItem } from '../collaboratorEvaluations/components/TabNavigation';
import EvaluationHeader from './components/CollaboratorEvaluationHeader';
import EvaluationCriteriaList from './components/EvaluationCriteriaList';
import ManagerEvaluationsHistory from './ManagerEvaluationsHistory';
import ClientEvaluation from '../collaborators/components/ClientEvaluation';
import type { DetailedSelfAssessment } from '../../../types/detailedEvaluations';

interface DashboardSubordinate {
  id: string;
  name: string;
  jobTitle: string;
  status: string;
}
interface CollaboratorGroup {
  subordinates: DashboardSubordinate[];
}

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

export const ALLOWED_CRITERIA_IDS = [
  'sentimento-de-dono',
  'resiliencia-nas-adversidades',
  'organizacao-no-trabalho',
  'capacidade-de-aprender',
  'ser-team-player',
  'entregar-com-qualidade',
  'atender-aos-prazos',
  'fazer-mais-com-menos',
  'pensar-fora-da-caixa',
];

export const ALLOWED_EXECUTION_CRITERIA_IDS = [
  'entregar-com-qualidade',
  'atender-aos-prazos',
  'fazer-mais-com-menos',
  'pensar-fora-da-caixa',
];

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
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false);
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
        const [selfAssessment, dashboardData, historyData] = await Promise.all([
          ManagerService.getDetailedSelfAssessment(collaboratorIdFromUrl),
          ManagerService.getManagerDashboard('2025.1'),
          ManagerService.getCollaboratorPerformanceHistory(collaboratorIdFromUrl),
        ]);
        setDetailedSelfAssessment(selfAssessment);
        setPerformanceHistory(historyData);
        const subordinates =
          dashboardData?.collaboratorsInfo?.flatMap((group: CollaboratorGroup) => group.subordinates) ?? [];
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
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score, justification: prev[criterionId]?.justification ?? '' },
    }));
  };
  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification, score: prev[criterionId]?.score ?? 0 },
    }));
  };

  // --- LÓGICA DE SUBMISSÃO FINAL IMPLEMENTADA AQUI ---
  const handleSubmitManagerAssessment = async () => {
    const completedCount = getManagerCompletionCount().completed;
    if (completedCount < ALLOWED_CRITERIA_IDS.length) {
      toast.error('Erro de Validação', 'Por favor, preencha a nota e a justificativa para todos os critérios.');
      return;
    }

    setIsAssessmentSubmitted(true);
    toast.info('Aguarde', 'A enviar a sua avaliação...');

    const payloadToSend: Record<string, any> = {
      evaluatedUserId: collaboratorIdFromUrl,
      cycle: '2025.1',
      assessments: []
    };

    ALLOWED_CRITERIA_IDS.forEach(criterionId => {
      const scoreKey = `${criterionId.replace(/-/g, '')}Score`;
      const justificationKey = `${criterionId.replace(/-/g, '')}Justification`;
      payloadToSend[scoreKey] = managerAssessments[criterionId].score;
      payloadToSend[justificationKey] = managerAssessments[criterionId].justification;
    });

    try {
      await ManagerService.submitManagerSubordinateAssessment(payloadToSend as any);
      toast.success('Sucesso', 'Avaliação enviada e salva com sucesso!');

      // Após o sucesso, navega de volta para a lista após um breve atraso
      setTimeout(() => {
        navigate('/manager/collaborators');
      }, 1500);
    } catch (submitError) {
      toast.error(
        'Falha na Submissão',
        submitError instanceof Error ? submitError.message : 'Ocorreu um erro desconhecido.',
      );
      setIsAssessmentSubmitted(false); // Permite tentar novamente em caso de erro
    }
  };

  const getCriterionName = (id: string) => {
    const names: Record<string, string> = {
      'sentimento-de-dono': 'Sentimento de Dono',
      'resiliencia-nas-adversidades': 'Resiliência nas adversidades',
      'organizacao-no-trabalho': 'Organização no Trabalho',
      'capacidade-de-aprender': 'Capacidade de aprender',
      'ser-team-player': 'Ser "team player"',
      'entregar-com-qualidade': 'Entregar com qualidade',
      'atender-aos-prazos': 'Atender aos prazos',
      'fazer-mais-com-menos': 'Fazer mais com menos',
      'pensar-fora-da-caixa': 'Pensar fora da caixa',
    };
    return names[id] || id;
  };

  const getManagerCompletionCount = () => {
    const completed = ALLOWED_CRITERIA_IDS.filter(
      id => (managerAssessments[id]?.score ?? 0) > 0 && (managerAssessments[id]?.justification ?? '').trim() !== '',
    ).length;
    return { completed, total: ALLOWED_CRITERIA_IDS.length };
  };

  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set());
  const toggleCriterionExpansion = (id: string) => {
    const newSet = new Set(expandedCriterion);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedCriterion(newSet);
  };

  if (isLoading) {
    return <div className='p-8 text-center'>Carregando...</div>;
  }
  if (error) {
    return <div className='p-8 text-center text-red-500'>Erro: {error}</div>;
  }
  if (!detailedSelfAssessment) {
    return <div className='p-8 text-center'>Autoavaliação não encontrada.</div>;
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <EvaluationHeader
        isAssessmentSubmitted={isAssessmentSubmitted}
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
      <main className='px-6 pb-8'>
        {activeTab === 'evaluation' && (
          <EvaluationCriteriaList
            isAssessmentSubmitted={isAssessmentSubmitted}
            answers={detailedSelfAssessment.answers}
            managerAssessments={managerAssessments}
            expandedCriterion={expandedCriterion}
            completion={getManagerCompletionCount()}
            getCriterionName={getCriterionName}
            onToggleExpansion={toggleCriterionExpansion}
            onRatingChange={handleManagerRatingChange}
            onJustificationChange={handleManagerJustificationChange}
          />
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
