// src/types/detailedEvaluations.d.ts

// ALTERADO: Importa o tipo base do nosso ficheiro central
import { type SelfAssessmentAnswer } from './evaluations';

export interface CompletionStatusCategory {
  completed: number;
  total: number;
}

// Esta interface agora usa o tipo importado, garantindo consistência
export interface DetailedSelfAssessment {
  id: string;
  cycle: string;
  authorId: string;
  status: 'DRAFT' | 'SUBMITTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  answers: SelfAssessmentAnswer[]; // Usa o tipo importado
  completionStatus: {
    comportamento: CompletionStatusCategory;
    execucao: CompletionStatusCategory;
    gestao: CompletionStatusCategory;
    [key: string]: CompletionStatusCategory;
  };
  overallCompletion: {
    completed: number;
    total: number;
  };
}

// REMOVIDO: As outras interfaces foram movidas para 'evaluations.d.ts' para centralização.