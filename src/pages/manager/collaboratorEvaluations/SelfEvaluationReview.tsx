// src/pages/manager/collaboratorEvaluations/SelfEvaluationReview.tsx

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
// Seus imports existentes (não foram alterados)
import EvaluationCriteriaList from '../collaborators/components/EvaluationCriteriaList'; 
import type { SelfAssessmentAnswer, ManagerCriterionState } from '../../../types/evaluations'; 
import type { DetailedSelfAssessment } from '../../../types/detailedEvaluations';


// As constantes de critérios
const ALLOWED_CRITERIA_IDS = [
  'sentimento_dono', 'resiliencia', 'organizacao', 'capacidade_aprender', 'team_player',
  'qualidade', 'prazos', 'fazer_mais_com_menos', 'pensar_fora_da_caixa'
];
const criteriaNames: Record<string, string> = {
  sentimento_dono: 'Sentimento de Dono',
  resiliencia: 'Resiliência nas adversidades',
  organizacao: 'Organização no Trabalho',
  capacidade_aprender: 'Capacidade de aprender',
  team_player: 'Ser "team player"',
  qualidade: 'Entregar com qualidade',
  prazos: 'Atender aos prazos',
  'fazer_mais_com_menos': 'Fazer mais com menos',
  'pensar_fora_da_caixa': 'Pensar fora da caixa'
};


export interface SelfEvaluationReviewRef {
  getFormData: () => Record<string, ManagerCriterionState>;
}

interface SelfEvaluationReviewProps {
  collaboratorId: string;
}

const SelfEvaluationReview = forwardRef<SelfEvaluationReviewRef, SelfEvaluationReviewProps>(({ collaboratorId }, ref) => {
  const [formData, setFormData] = useState<Record<string, ManagerCriterionState>>({});
  const [selfAnswers, setSelfAnswers] = useState<SelfAssessmentAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collaboratorId) return;

    const fetchSelfAssessment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // AQUI ESTÁ A ÚNICA ALTERAÇÃO: Adicionamos a opção de cache
        const response = await fetch(
          `/api/evaluations/manager/subordinate/${collaboratorId}/self-assessment`,
          { cache: 'no-cache' } // ADICIONADO: Força o navegador a não usar o cache
        );

        if (!response.ok) {
          throw new Error('A autoavaliação para este colaborador não foi encontrada ou ocorreu um erro.');
        }
        const data: DetailedSelfAssessment = await response.json();
        
        setSelfAnswers(data.answers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados.');
        setSelfAnswers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelfAssessment();
  }, [collaboratorId]);

  // O resto do componente continua como você enviou
  useImperativeHandle(ref, () => ({ getFormData: () => formData }));
  const handleRatingChange = (criterionId: string, score: number) => { setFormData(prev => ({ ...prev, [criterionId]: { ...prev[criterionId], score, justification: prev[criterionId]?.justification ?? '' } })); };
  const handleJustificationChange = (criterionId: string, justification: string) => { setFormData(prev => ({ ...prev, [criterionId]: { ...prev[criterionId], justification, score: prev[criterionId]?.score ?? 0 } })); };
  const completion = useMemo(() => { const completed = ALLOWED_CRITERIA_IDS.filter(id => formData[id]?.score > 0 && formData[id]?.justification?.trim() !== '').length; return { completed, total: ALLOWED_CRITERIA_IDS.length }; }, [formData]);
  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set());
  const handleToggleExpansion = (criterionId: string) => { setExpandedCriterion(prev => { const newSet = new Set(prev); newSet.has(criterionId) ? newSet.delete(criterionId) : newSet.add(criterionId); return newSet; }); };

  if (isLoading) {
    return <div className='p-8 text-center'>A carregar autoavaliação...</div>;
  }
  if (error) {
    return <div className='p-8 text-center text-red-500'>{error}</div>;
  }

  return (
    <div className='p-4 md:p-6'>
      <EvaluationCriteriaList
        isAssessmentSubmitted={false}
        answers={selfAnswers}
        managerAssessments={formData}
        expandedCriterion={expandedCriterion}
        completion={completion}
        getCriterionName={(id: string) => criteriaNames[id] || id}
        onToggleExpansion={handleToggleExpansion}
        onRatingChange={handleRatingChange}
        onJustificationChange={handleJustificationChange}
      />
    </div>
  );
});

export default SelfEvaluationReview;