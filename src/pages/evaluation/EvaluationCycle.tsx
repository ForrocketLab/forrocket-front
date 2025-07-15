import { useEffect, useState, useRef } from 'react';
import CreateEvaluationHeader from '../../components/CreateEvaluationHeader';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import { TabItem } from '../manager/collaborators/components/TabNavigation';
import EvaluationsForm, { type EvaluationFormRef } from '../../components/EvaluationForm';
import Evaluation360 from './Evaluation360';
import MentoringEvaluation from './MentoringEvaluation';
import ReferencesEvaluation from './ReferenceAssessment';
import EvaluationService from '../../services/EvaluationService';

const TABS: TabItem[] = [
  { id: 'self-assessment', label: 'Autoavaliação' },
  { id: '360assessment', label: 'Avaliação 360' },
  { id: 'mentoring', label: 'Mentoring' },
  { id: 'references', label: 'Referências' },
];

const EvaluationPage = () => {
  const toast = useGlobalToast();
  const [activeTab, setActiveTab] = useState('self-assessment');
  const [currentCycle, setCurrentCycle] = useState<string>('');

  // Referência para o formulário de avaliação
  const evaluationFormRef = useRef<EvaluationFormRef>(null);

  // Função para submeter avaliação final
  const handleSubmitAssessment = async () => {
    if (!evaluationFormRef.current) return;

    const isComplete = evaluationFormRef.current.isComplete();

    if (!isComplete) {
      toast.error('Avaliação incompleta', 'Por favor, complete todos os critérios antes de enviar.');
      return;
    }

    try {
      const data = evaluationFormRef.current.getAssessmentData();
      await EvaluationService.saveSelfAssessment(data);
      toast.success('Avaliação enviada', 'Sua avaliação foi enviada para análise.');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar', 'Não foi possível enviar a avaliação.');
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

  return (
    <div className='min-h-screen bg-[#F1F1F1]'>
      <CreateEvaluationHeader
        isAssessmentSubmitted={false}
        currentCycle={currentCycle}
        onSubmit={handleSubmitAssessment}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className='bg-[#F1F1F1]'>
        {activeTab === 'self-assessment' && (
          <div className='relative'>
            <EvaluationsForm ref={evaluationFormRef} />
          </div>
        )}
        {activeTab === '360assessment' && <Evaluation360 />}
        {activeTab === 'mentoring' && <MentoringEvaluation />}
        {activeTab === 'references' && <ReferencesEvaluation />}
      </main>
    </div>
  );
};

export default EvaluationPage;
