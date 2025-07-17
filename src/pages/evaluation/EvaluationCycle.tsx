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
import { useEvaluation, useEvaluationCompletion } from '../../hooks/useEvaluation';

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
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useEvaluation();
  const completionStatus = useEvaluationCompletion();

  // Função para submeter avaliação final
  const handleSubmitAssessment = async () => {
    // Prevenir submissão em modo read-only
    if (isReadOnly) {
      toast.error('Avaliação bloqueada', 'Não é possível enviar avaliações fora da fase de avaliações.');
      return;
    }

    const allComplete = Object.values(completionStatus).every(Boolean);

    if (!allComplete) {
      toast.error('Avaliações incompletas', 'Por favor, complete todas as avaliações antes de enviar.');
      return;
    }

    if (isSubmitting) {
      return; // Prevenir múltiplos cliques
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Iniciando envio de todas as avaliações...');

      // 1. Salvar autoavaliação
      if (Object.keys(state.selfAssessment).length > 0) {
        console.log('📝 Salvando autoavaliação:', state.selfAssessment);
        await EvaluationService.saveSelfAssessment(state.selfAssessment);
        console.log('✅ Autoavaliação salva com sucesso');
      }

      // 2. Salvar avaliações 360
      if (Object.keys(state.evaluation360).length > 0) {
        console.log('🎯 Salvando avaliações 360:', state.evaluation360);

        // Filtrar apenas avaliações com dados válidos e preparar array para batch
        const validEvaluations360 = Object.entries(state.evaluation360)
          .filter(([, data]) => data.rating > 0 && data.strengths && data.improvements)
          .map(([evaluatedUserId, data]) => ({
            id: evaluatedUserId,
            rating: data.rating,
            strengths: data.strengths,
            improvements: data.improvements,
            workAgainMotivation: data.workAgainMotivation || '',
          }));

        if (validEvaluations360.length > 0) {
          // Salvar todas as avaliações 360 em uma única requisição batch
          await EvaluationService.saveEvaluations360Batch(validEvaluations360);
          console.log('✅ Avaliações 360 salvas com sucesso');
        }
      }

      // 3. Salvar avaliações de mentoria
      if (Object.keys(state.mentoring).length > 0) {
        console.log('🎓 Salvando avaliações de mentoria:', state.mentoring);

        // Filtrar apenas avaliações com dados válidos
        const validMentoringEvaluations = Object.entries(state.mentoring).filter(
          ([, data]) => data.rating > 0 && data.justification.trim(),
        );

        if (validMentoringEvaluations.length > 0) {
          // Como há apenas uma avaliação de mentoria, pegar a primeira
          const [, mentorData] = validMentoringEvaluations[0];
          await EvaluationService.updateMentorAssessment({
            rating: mentorData.rating,
            justification: mentorData.justification,
          });
          console.log('✅ Avaliações de mentoria salvas com sucesso');
        }
      }

      // 4. Salvar referências
      if (state.references.length > 0) {
        console.log('📋 Salvando referências:', state.references);

        // Filtrar apenas referências com justificação preenchida
        const validReferences = state.references.filter(ref => ref.justification.trim());

        if (validReferences.length > 0) {
          await EvaluationService.saveAllReferenceFeedbacks(validReferences);
          console.log('✅ Referências salvas com sucesso');
        }
      }

      console.log('🎉 Todas as avaliações foram enviadas com sucesso!');
      toast.success('Avaliações enviadas', 'Todas as suas avaliações foram enviadas para análise.');
    } catch (error) {
      console.error('Erro ao enviar avaliações:', error);
      toast.error('Erro ao enviar', 'Não foi possível enviar as avaliações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        // Buscar todos os ciclos para encontrar o ativo com a fase
        const cycle = await EvaluationService.getActiveCycle();

        if (cycle) {
          setCurrentCycle(cycle.name);
          setCurrentPhase(cycle.phase);
          console.log('Ciclo ativo encontrado:', cycle.phase);
          setIsReadOnly(cycle.phase !== 'ASSESSMENTS');
        }
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
        isReadOnly={isReadOnly}
      />
      <main className='bg-[#F1F1F1]'>
        {activeTab === 'self-assessment' && <EvaluationsForm isReadOnly={isReadOnly} />}
        {activeTab === '360assessment' && <Evaluation360 isReadOnly={isReadOnly} />}
        {activeTab === 'mentoring' && <MentoringEvaluation isReadOnly={isReadOnly} />}
        {activeTab === 'references' && <ReferencesEvaluation isReadOnly={isReadOnly} />}
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
