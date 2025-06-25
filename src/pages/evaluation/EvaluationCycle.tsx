import { useState } from 'react';
import Topbar from '../../components/TopBar';
import Evaluation360 from '../../components/evaluation/360evaluation/360Evaluation';
import Mentoring from '../../components/evaluation/mentoring/Mentoring';
import SelfEvaluation from '../../components/evaluation/selfevaluation/SelfEvaluation';
import RefCollaborator from '../../components/evaluation/referencias/RefCollaborator';
import { useEvaluation } from '../../contexts/EvaluationProvider';

const NAV_BUTTONS = ['Autoavaliação', 'Avaliação 360', 'Mentoring', 'Referências'] as const;
type NavButtonType = typeof NAV_BUTTONS[number];

const EvaluationPage = () => {
  const [activeButton, setActiveButton] = useState<NavButtonType>('Autoavaliação');

  const { 
    isSelfEvaluationComplete, 
    isMentoringComplete,
    isEvaluation360Complete,
    evaluations360,
    isReferenceFeedbackComplete 
  } = useEvaluation();

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

  return (
    <div>
      <div className="pt-36 min-h-screen bg-[#F1F1F1]">
        <Topbar
          onSave={handleSaveAndSubmit}
          isSaveDisabled={isFinalSaveDisabled}
          activeButton={activeButton}
          onNavButtonClick={setActiveButton}
        />
        <main className="bg-[#F1F1F1]">
          {activeButton === 'Autoavaliação' && <SelfEvaluation initialSelfAssessmentData={null} cycleId="2025.1" />}
          {activeButton === 'Avaliação 360' && <Evaluation360 />}
          {activeButton === 'Mentoring' && <Mentoring />}
          {activeButton === 'Referências' && <RefCollaborator />}
        </main>
      </div>
    </div>
  );
};

export default EvaluationPage;