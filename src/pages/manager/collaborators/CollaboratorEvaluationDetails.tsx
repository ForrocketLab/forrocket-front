import { type FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import DashboardService from '../../../services/ManagerService';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { TabItem } from '../collaboratorEvaluations/components/TabNavigation';
import EvaluationHeader from './components/CollaboratorEvaluationHeader';
import EvaluationCriteriaList from './components/EvaluationCriteriaList';
import Manager360Evaluations from './Manager360Evaluations';

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const toast = useGlobalToast();

  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null);
  const [activeCycleName, setActiveCycleName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set());

  // Estados para armazenar o nome e o cargo do colaborador dinamicamente
  const [collaboratorName, setCollaboratorName] = useState('Colaborador Avaliado'); // Valor inicial de placeholder
  const [collaboratorJobTitle, setCollaboratorJobTitle] = useState('Cargo do Colaborador'); // Valor inicial de placeholder

  const [managerAssessments, setManagerAssessments] = useState<Record<string, ManagerCriterionState>>({});

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

        // Buscar dados do dashboard para obter o nome e o cargo do colaborador
        // Esta é uma solução alternativa se 'detailedSelfAssessment' não contiver isso diretamente
        const dashboardData = await DashboardService.getManagerDashboard(activeCycle.name);
        const foundCollaborator = dashboardData.collaboratorsInfo
          .flatMap(group => group.subordinates)
          .find(sub => sub.id === collaboratorIdFromUrl);

        if (foundCollaborator) {
          setCollaboratorName(foundCollaborator.name);
          setCollaboratorJobTitle(foundCollaborator.jobTitle);
        } else {
          // Fallback se não for encontrado nos dados do dashboard
          setCollaboratorName('Colaborador Desconhecido');
          setCollaboratorJobTitle('Cargo Desconhecido');
        }

        const initialManagerAssessments: Record<string, ManagerCriterionState> = {};
        selfAssessment.answers.forEach((answer: { criterionId: string | number }) => {
          initialManagerAssessments[answer.criterionId] = { score: 0, justification: '' };
        });
        setManagerAssessments(initialManagerAssessments);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados de avaliação.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [collaboratorIdFromUrl]); // Depende de collaboratorIdFromUrl

  const handleManagerRatingChange = (criterionId: string, score: number) => {
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score },
    }));
  };

  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    setManagerAssessments(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification },
    }));
  };

  const getManagerCompletionCount = () => {
    const total = detailedSelfAssessment?.answers.length || 0;
    const completed =
      detailedSelfAssessment?.answers.filter(answer => {
        const managerAssessment = managerAssessments[answer.criterionId];
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

    const payload: CreateManagerSubordinateAssessment = {
      evaluatedUserId: collaboratorIdFromUrl,
      cycle: activeCycleName,
      assessments: Object.entries(managerAssessments).map(([criterionId, data]) => ({
        criterionId,
        score: data.score,
        justification: data.justification,
      })),
    };

    try {
      toast.success('Sucesso', 'Avaliação do gestor enviada com sucesso!');
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : 'Falha ao enviar avaliação.';
      toast.error('Erro', msg);
    }
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
      'atender-prazos': 'Atender Prazos',
      'capacidade-aprender': 'Capacidade de Aprender',
      'entregar-qualidade': 'Entregar Qualidade',
      'evolucao-rocket': 'Evolução Rocket',
      'fazer-mais-menos': 'Fazer Mais com Menos',
      'gestao-gente': 'Gestão de Pessoas',
      'gestao-resultados': 'Gestão de Resultados',
      'organizacao-trabalho': 'Organização no Trabalho',
      'pensar-fora-caixa': 'Pensar Fora da Caixa',
      'resiliencia-adversidades': 'Resiliência nas Adversidades',
      'sentimento-de-dono': 'Sentimento de Dono',
      'team-player': 'Ser "Team Player"',
    };
    return map[criterionId] || criterionId.replace(/-/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
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

  const collaboratorInitials = getInitials(collaboratorName);

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

  const { completed, total } = getManagerCompletionCount();

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='flex flex-col flex-1'>
        <EvaluationHeader
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
          {activeTab === 'history' && <div className='text-center p-8'>Conteúdo do Histórico</div>}
        </main>
      </div>
    </div>
  );
};

export default CollaboratorEvaluationDetails;
