import { useContext } from 'react';
import {
  EvaluationContext,
  type SelfAssessmentData,
  type Evaluation360Data,
  type MentoringData,
} from '../contexts/EvaluationContext';
import { ReferenceAssessmentDto } from '../services/EvaluationService';

// Hook para usar o context
export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
};

// Hook para verificar completude
export const useEvaluationCompletion = () => {
  const { state } = useEvaluation();

  const checkSelfAssessmentComplete = () => {
    const entries = Object.entries(state.selfAssessment);
    return (
      entries.length > 0 &&
      entries.every(
        ([, data]: [string, SelfAssessmentData[string]]) =>
          data && data.score > 0 && data.justification && data.justification.trim() !== '',
      )
    );
  };

  const checkEvaluation360Complete = () => {
    const entries = Object.entries(state.evaluation360);
    return (
      entries.length > 0 &&
      entries.every(
        ([, data]: [string, Evaluation360Data[string]]) =>
          data &&
          data.rating > 0 &&
          data.strengths &&
          data.strengths.trim() !== '' &&
          data.improvements &&
          data.improvements.trim() !== '' &&
          data.workAgainMotivation &&
          data.workAgainMotivation.trim() !== '',
      )
    );
  };

  const checkMentoringComplete = () => {
    const entries = Object.entries(state.mentoring);
    return (
      entries.length > 0 &&
      entries.every(
        ([, data]: [string, MentoringData[string]]) =>
          data && data.rating > 0 && data.justification && data.justification.trim() !== '',
      )
    );
  };

  const checkReferencesComplete = () => {
    return (
      state.references.length > 0 &&
      state.references.some(
        (ref: ReferenceAssessmentDto) => ref && ref.justification && ref.justification.trim() !== '',
      )
    );
  };

  return {
    selfAssessment: checkSelfAssessmentComplete(),
    evaluation360: checkEvaluation360Complete(),
    mentoring: checkMentoringComplete(),
    references: checkReferencesComplete(),
  };
};
