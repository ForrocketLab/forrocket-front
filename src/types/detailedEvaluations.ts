export interface SelfAssessmentAnswer {
  id: string;
  selfAssessmentId: string;
  criterionId: string; // O ID do critério/pergunta
  score: number;
  justification: string; // A resposta/justificativa
}

export interface CompletionStatusCategory {
  completed: number;
  total: number;
}

export interface DetailedSelfAssessment {
  id: string; // ID da autoavaliação
  cycle: string;
  authorId: string; // O ID do autor da autoavaliação
  status: 'DRAFT' | 'SUBMITTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string; // Data de submissão (pode ser usado como submissionDate)
  answers: SelfAssessmentAnswer[]; // Array de respostas para cada critério/pergunta
  completionStatus: {
    comportamento: CompletionStatusCategory;
    execucao: CompletionStatusCategory;
    gestao: CompletionStatusCategory;
    [key: string]: CompletionStatusCategory; // Para permitir outras categorias dinâmicas
  };
  overallCompletion: {
    completed: number;
    total: number;
  };
}

// NOVAS INTERFACES PARA AVALIAÇÃO DO GESTOR
export interface ManagerAssessmentCriterion {
  criterionId: string;
  score: number;
  justification: string;
}

export interface CreateManagerSubordinateAssessment {
  evaluatedUserId: string; // ID do colaborador que está sendo avaliado
  cycle: string; // Ciclo atual (ex: 2025.2)
  assessments: ManagerAssessmentCriterion[];
}