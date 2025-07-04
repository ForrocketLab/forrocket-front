/**
 * DTO para usuário avaliável
 */
export interface EvaluableUser {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    seniority: string;
    roles: string[];
}

/**
 * DTO para resposta de usuários avaliáveis
 */
export interface EvaluableUsersResponse {
    colleagues: EvaluableUser[];
    managers: EvaluableUser[];
    mentors: EvaluableUser[];
}

/**
 * Payload para criar uma avaliação 360
 */
export interface Create360AssessmentPayload {
    evaluatedUserId: string;
    overallScore: number;
    strengths: string;
    improvements: string;
}

/**
 * Payload para criar uma avaliação de mentoring
 */
export interface CreateMentoringAssessmentPayload {
    mentorId: string;
    score: number;
    justification: string;
}

// --- TIPOS ADICIONADOS PARA A AVALIAÇÃO DO GESTOR ---

/**
 * Representa a resposta da autoavaliação de um colaborador para um único critério.
 * Inclui os campos que o erro de compilação anterior indicava estarem em falta.
 */
export interface SelfAssessmentAnswer {
  id: string;
  selfAssessmentId: string;
  criterionId: string;
  score: number;
  justification: string;
}

/**
 * Representa o estado da avaliação que o gestor está a preencher para um único critério.
 */
export interface ManagerCriterionState {
  score: number;
  justification: string;
}

/**
 * Representa o payload completo para submeter a avaliação de um gestor.
 * Foi movido do detailedEvaluations para cá por ser um payload de criação.
 */
export interface CreateManagerSubordinateAssessment {
  evaluatedUserId: string;
  cycle: string;
  assessments: ManagerAssessmentCriterion[];
}


/**
 * Payload para criar uma avaliação 360
 */
export interface Create360AssessmentPayload {
  evaluatedUserId: string;
  overallScore: number;
  strengths: string;
  improvements: string;
}