import { useState, useEffect } from 'react';
import Topbar from '../../components/TopBar';
import Evaluation360 from '../../components/evaluation/360evaluation/360Evaluation';
import Mentoring from '../../components/evaluation/mentoring/Mentoring';
import SelfEvaluation from '../../components/evaluation/selfevaluation/SelfEvaluation';
import RefCollaborator from '../../components/evaluation/referencias/RefCollaborator';
import { useEvaluation } from '../../contexts/EvaluationProvider';
import EvaluationService, { type SelfAssessmentResponse } from '../../services/EvaluationService';
import LoadingSpinner from '../../components/LoadingSpinner';

const NAV_BUTTONS = ['Autoavaliação', 'Avaliação 360', 'Mentoring', 'Referências'] as const;
type NavButtonType = typeof NAV_BUTTONS[number];

const EvaluationPage = () => {
  const [activeButton, setActiveButton] = useState<NavButtonType>('Autoavaliação');
  const [selfAssessmentData, setSelfAssessmentData] = useState<SelfAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { 
    isSelfEvaluationComplete, 
    isMentoringComplete,
    isEvaluation360Complete,
    evaluations360,
    isReferenceFeedbackComplete 
  } = useEvaluation();

  // Função para transformar dados do backend para o formato esperado pelo frontend
  const transformBackendDataToFrontend = (backendData: any): SelfAssessmentResponse => {
    const emptyCriterion = { score: null, justification: '' };
    
    // Inicializar com valores vazios
    const postureCriteria = {
      sentimentoDeDono: { ...emptyCriterion },
      resilienciaNasAdversidades: { ...emptyCriterion },
      organizacaoNoTrabalho: { ...emptyCriterion },
      capacidadeDeAprender: { ...emptyCriterion },
      serTeamPlayer: { ...emptyCriterion },
    };

    const executionCriteria = {
      entregarComQualidade: { ...emptyCriterion },
      atenderAosPrazos: { ...emptyCriterion },
      fazerMaisComMenos: { ...emptyCriterion },
      pensarForaDaCaixa: { ...emptyCriterion },
    };

    const peopleAndManagementCriteria = {
      gente: { ...emptyCriterion },
      resultados: { ...emptyCriterion },
      evolucaoDaRocketCorp: { ...emptyCriterion },
    };

    // Mapear os critérios do backend para o frontend
    const criterionMapping: Record<string, { group: 'posture' | 'execution' | 'people', key: string }> = {
      'sentimento-de-dono': { group: 'posture', key: 'sentimentoDeDono' },
      'resiliencia-adversidades': { group: 'posture', key: 'resilienciaNasAdversidades' },
      'organizacao-trabalho': { group: 'posture', key: 'organizacaoNoTrabalho' },
      'capacidade-aprender': { group: 'posture', key: 'capacidadeDeAprender' },
      'team-player': { group: 'posture', key: 'serTeamPlayer' },
      'entregar-qualidade': { group: 'execution', key: 'entregarComQualidade' },
      'atender-prazos': { group: 'execution', key: 'atenderAosPrazos' },
      'fazer-mais-menos': { group: 'execution', key: 'fazerMaisComMenos' },
      'pensar-fora-caixa': { group: 'execution', key: 'pensarForaDaCaixa' },
      'gestao-gente': { group: 'people', key: 'gente' },
      'gestao-resultados': { group: 'people', key: 'resultados' },
      'evolucao-rocket': { group: 'people', key: 'evolucaoDaRocketCorp' },
    };

    // Preencher os dados baseado nas respostas do backend
    if (backendData.answers) {
      backendData.answers.forEach((answer: any) => {
        const mapping = criterionMapping[answer.criterionId];
        if (mapping) {
          const criterion = { score: answer.score, justification: answer.justification || '' };
          
          if (mapping.group === 'posture') {
            (postureCriteria as any)[mapping.key] = criterion;
          } else if (mapping.group === 'execution') {
            (executionCriteria as any)[mapping.key] = criterion;
          } else if (mapping.group === 'people') {
            (peopleAndManagementCriteria as any)[mapping.key] = criterion;
          }
        }
      });
    }

    return {
      id: backendData.id,
      cycle: backendData.cycle,
      status: backendData.status,
      createdAt: backendData.createdAt,
      updatedAt: backendData.updatedAt,
      postureCriteria,
      executionCriteria,
      peopleAndManagementCriteria,
    };
  };

  // Buscar dados da autoavaliação do servidor
  useEffect(() => {
    const loadSelfAssessmentData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const cycleId = "2025.1"; // Ciclo ativo - poderia vir de um contexto
        const evaluationsData = await EvaluationService.getUserEvaluationsByCycle(cycleId);
        
        if (evaluationsData.selfAssessment) {
          console.log('📥 Dados brutos do servidor:', evaluationsData.selfAssessment);
          
          // Transformar os dados do formato do backend para o formato do frontend
          const transformedData = transformBackendDataToFrontend(evaluationsData.selfAssessment);
          console.log('📊 Dados transformados para o frontend:', transformedData);
          
          setSelfAssessmentData(transformedData);
        } else {
          console.log('📋 Nenhuma autoavaliação encontrada no servidor para o ciclo', cycleId);
          setSelfAssessmentData(null);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar autoavaliação:', error);
        setLoadError(error instanceof Error ? error.message : 'Erro desconhecido');
        setSelfAssessmentData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelfAssessmentData();
  }, []);

  // Verificação do estado de conclusão de cada módulo
  const selfEvalCompleted = isSelfEvaluationComplete();
  const mentoringCompleted = isMentoringComplete();
  const all360EvaluationsCompleted = evaluations360.length > 0 && evaluations360.every(e => isEvaluation360Complete(e.collaborator.id));
  const referencesCompleted = isReferenceFeedbackComplete();

  // O botão é desabilitado se QUALQUER uma das seções estiver incompleta
  const isFinalSaveDisabled = !selfEvalCompleted || !mentoringCompleted || !all360EvaluationsCompleted || !referencesCompleted;

  const handleSaveAndSubmit = () => {
    if (isFinalSaveDisabled) {
      alert("Por favor, preencha todas as seções obrigatórias da avaliação.");
      return;
    }
    // Lógica para coletar TODOS os dados do contexto e enviar para a API
    console.log("Todos os dados prontos para serem enviados!");
    alert("Avaliação enviada com sucesso!");
  };

  // Renderizar conteúdo com base no estado de carregamento
  const renderContent = () => {
    if (activeButton === 'Autoavaliação') {
      if (isLoading) {
        return (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">Carregando autoavaliação...</span>
          </div>
        );
      }
      
      if (loadError) {
        return (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">❌ Erro ao carregar autoavaliação</p>
              <p className="text-gray-600 text-sm">{loadError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        );
      }
      
      return <SelfEvaluation initialSelfAssessmentData={selfAssessmentData} cycleId="2025.1" />;
    }
    
    if (activeButton === 'Avaliação 360') return <Evaluation360 />;
    if (activeButton === 'Mentoring') return <Mentoring />;
    if (activeButton === 'Referências') return <RefCollaborator />;
    
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1]">
      <Topbar
        onSave={handleSaveAndSubmit}
        isSaveDisabled={isFinalSaveDisabled}
        activeButton={activeButton}
        onNavButtonClick={setActiveButton}
      />
      <main className="bg-[#F1F1F1]">
        {renderContent()}
      </main>
    </div>
  );
};

export default EvaluationPage;