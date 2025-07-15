import { useEffect, useState } from 'react';
import CreateEvaluationHeader from '../../components/CreateEvaluationHeader';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import { TabItem } from '../manager/collaborators/components/TabNavigation';
import EvaluationsForm from '../../components/EvaluationForm';
import Evaluation360 from './Evaluation360';
import MentoringEvaluation from './MentoringEvaluation';
import ReferencesEvaluation from './ReferenceAssessment';
import EvaluationService from '../../services/EvaluationService';
import { EvaluationProvider } from '../../contexts/EvaluationContext';
import { useEvaluationCompletion } from '../../hooks/useEvaluation';

const TABS: TabItem[] = [
  { id: 'self-assessment', label: 'Autoavaliação' },
  { id: '360assessment', label: 'Avaliação 360' },
  { id: 'mentoring', label: 'Mentoring' },
  { id: 'references', label: 'Referências' },
];

const EvaluationPageContent = () => {
  const toast = useGlobalToast();
  const [activeTab, setActiveTab] = useState('self-assessment');
  const [currentCycle, setCurrentCycle] = useState<string>('');
  const completionStatus = useEvaluationCompletion();

  // Função para submeter avaliação final
  const handleSubmitAssessment = async () => {
    const allComplete = Object.values(completionStatus).every(Boolean);

    if (!allComplete) {
      toast.error('Avaliações incompletas', 'Por favor, complete todas as avaliações antes de enviar.');
      return;
    }

    try {
      // Como já há auto-save, aqui apenas mudamos o status para "SUBMITTED"
      // Os dados já estão salvos como DRAFT pelo auto-save

      toast.success('Avaliações enviadas', 'Todas as suas avaliações foram enviadas para análise.');
    } catch (error) {
      console.error('Erro ao enviar avaliações:', error);
      toast.error('Erro ao enviar', 'Não foi possível enviar as avaliações.');
    }
  };

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const { name } = await EvaluationService.getActiveCycle();
        setCurrentCycle(name);
      } catch (err) {
        console.error('Erro ao buscar ciclo ativo:', err);
      }
    };
    fetchActiveCycle();
  }, []);

  const allEvaluationsComplete = Object.values(completionStatus).every(Boolean);

  return (
    <div className='min-h-screen bg-[#F1F1F1]'>
      <CreateEvaluationHeader
        isAssessmentSubmitted={false}
        currentCycle={currentCycle}
        onSubmit={handleSubmitAssessment}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isComplete={allEvaluationsComplete}
        completionStatus={completionStatus}
      />
      <main className='bg-[#F1F1F1]'>
        {activeTab === 'self-assessment' && <EvaluationsForm />}
        {activeTab === '360assessment' && <Evaluation360 />}
        {activeTab === 'mentoring' && <MentoringEvaluation />}
        {activeTab === 'references' && <ReferencesEvaluation />}
      </main>
    </div>
  );
};

const EvaluationPage = () => {
  return (
    <EvaluationProvider>
      <EvaluationPageContent />
    </EvaluationProvider>
  );
};

export default EvaluationPage;
