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

export interface Highlight {
  type: 'achievement' | 'concern' | 'info';
  title: string;
  description: string;
  value?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CriterionDetail {
  id: string;
  description: string;
  pillar: string;
  selfScore?: number;
  managerScore?: number;
  committeeScore?: number;
}

export interface CriterionEvolution {
  id: string;
  description: string;
  pillar: string;
  selfAverage: number;
  managerAverage: number;
  committeeAverage: number;
}

export interface CycleDetailedData {
  cycle: string;
  selfAssessmentScore: number | null;
  managerAssessmentScore: number | null;
  committeeAssessmentScore: number | null;
  criteria: CriterionDetail[];
  comments: string[];
}

export interface CollaboratorDetailedEvolution {
  collaborator: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    seniority: string;
    businessUnit: string;
    careerTrack: string;
    managerName: string | null;
    mentorName: string | null;
  };
  summary: {
    totalCycles: number;
    bestScore: number | null;
    worstScore: number | null;
    historicalAverage: number;
    overallTrend: string;
    consistencyScore: number;
  };
  cycleDetails: CycleDetailedData[];
  criteriaEvolution: CriterionEvolution[];
  pillarEvolution: PillarEvolutionData[];
  insights: EvolutionInsight[];
  benchmarking: any;
  predictions: any;
} 