import { useEffect, useCallback } from 'react';
import { useEvaluation } from './useEvaluation';
import EvaluationService from '../services/EvaluationService';

/**
 * Hook para auto-save de todos os tipos de avaliação
 * Salva automaticamente no backend como DRAFT sem mostrar toasts ou loading
 */
export const useAutoSave = () => {
  const { state } = useEvaluation();

  // Auto-save para autoavaliação
  const saveSelfAssessment = useCallback(async () => {
    try {
      if (Object.keys(state.selfAssessment).length > 0) {
        // Verificar se há pelo menos um critério com dados válidos
        const hasValidData = Object.values(state.selfAssessment).some(
          criterion => criterion.score > 0 || (criterion.justification && criterion.justification.trim()),
        );

        if (hasValidData) {
          await EvaluationService.saveSelfAssessment(state.selfAssessment);
        }
      }
    } catch (error) {
      // Silencioso - sem toast ou loading
      console.error('Auto-save erro (Self Assessment):', error);
    }
  }, [state.selfAssessment]);

  // Auto-save para avaliação 360
  const saveEvaluation360 = useCallback(async () => {
    try {
      if (Object.keys(state.evaluation360).length > 0) {
        const validEvaluations = Object.entries(state.evaluation360)
          .filter(([, data]) => {
            return (
              data.rating > 0 ||
              (data.strengths && data.strengths.trim()) ||
              (data.improvements && data.improvements.trim()) ||
              (data.workAgainMotivation && data.workAgainMotivation.trim())
            );
          })
          .map(([colleagueId, data]) => ({
            id: colleagueId,
            rating: data.rating,
            strengths: data.strengths || '',
            improvements: data.improvements || '',
            workAgainMotivation: data.workAgainMotivation || '',
          }));

        if (validEvaluations.length > 0) {
          await EvaluationService.saveEvaluations360Batch(validEvaluations);
        }
      }
    } catch (error) {
      // Silencioso - sem toast ou loading
      console.error('Auto-save erro (360 Assessment):', error);
    }
  }, [state.evaluation360]);

  // Auto-save para mentoring
  const saveMentoring = useCallback(async () => {
    try {
      if (Object.keys(state.mentoring).length > 0) {
        for (const [, data] of Object.entries(state.mentoring)) {
          if (data.rating > 0 || (data.justification && data.justification.trim())) {
            await EvaluationService.updateMentorAssessment({
              rating: data.rating,
              justification: data.justification,
            });
          }
        }
      }
    } catch (error) {
      // Silencioso - sem toast ou loading
      console.error('Auto-save erro (Mentoring):', error);
    }
  }, [state.mentoring]);

  // Auto-save para referências
  const saveReferences = useCallback(async () => {
    try {
      if (state.references.length > 0) {
        const validReferences = state.references.filter(ref => ref.justification && ref.justification.trim());

        if (validReferences.length > 0) {
          await EvaluationService.saveAllReferenceFeedbacks(validReferences);
        }
      }
    } catch (error) {
      // Silencioso - sem toast ou loading
      console.error('Auto-save erro (References):', error);
    }
  }, [state.references]);

  // Auto-save para autoavaliação com debounce
  useEffect(() => {
    const timeoutId = setTimeout(saveSelfAssessment, 2000);
    return () => clearTimeout(timeoutId);
  }, [saveSelfAssessment]);

  // Auto-save para avaliação 360 com debounce
  useEffect(() => {
    const timeoutId = setTimeout(saveEvaluation360, 2000);
    return () => clearTimeout(timeoutId);
  }, [saveEvaluation360]);

  // Auto-save para mentoring com debounce
  useEffect(() => {
    const timeoutId = setTimeout(saveMentoring, 2000);
    return () => clearTimeout(timeoutId);
  }, [saveMentoring]);

  // Auto-save para referências com debounce
  useEffect(() => {
    const timeoutId = setTimeout(saveReferences, 2000);
    return () => clearTimeout(timeoutId);
  }, [saveReferences]);

  return {
    saveSelfAssessment,
    saveEvaluation360,
    saveMentoring,
    saveReferences,
  };
};

// Manter compatibilidade com o nome antigo
export const useAutoSave360 = useAutoSave;
