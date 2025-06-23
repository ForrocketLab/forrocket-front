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