import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/TopBar';
import Evaluation360 from '../../components/evaluation/360evaluation/360Evaluation';
import Mentoring from '../../components/evaluation/mentoring/Mentoring';
import SelfEvaluation from '../../components/evaluation/selfevaluation/SelfEvaluation';

const NAV_BUTTONS = ['Autoavaliação', 'Avaliação 360', 'Mentoring', 'Referências'] as const;
type NavButtonType = typeof NAV_BUTTONS[number];

const EvaluationPage = () => {
  const [activeButton, setActiveButton] = useState<NavButtonType>('Autoavaliação');

  return (
    <div>
      <Sidebar />
      <div className="ml-[232px] min-h-screen bg-[#F1F1F1]">
        <Topbar
          onSave={function (): void {
            throw new Error('Function not implemented.');
          }}
          isSaveDisabled={false}
          activeButton={activeButton}
          onNavButtonClick={setActiveButton}
        />
        <main className="p-8 bg-[#F1F1F1] mt-[120px]">
          {/* conteúdo da página de avaliação */}
          {activeButton === 'Autoavaliação' && (
            <SelfEvaluation 
              initialSelfAssessmentData={null} 
              cycleId="2025.1" 
            />
          )}
          {activeButton === 'Avaliação 360' && <Evaluation360 />}
          {activeButton === 'Mentoring' && <Mentoring />}
          {activeButton === 'Referências' && <div>Conteúdo de Referências</div>}
        </main>
      </div>
    </div>
  );
};

export default EvaluationPage;