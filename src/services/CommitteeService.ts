import { AxiosError } from 'axios';
import api from '../api';

interface CollaboratorForEqualization {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  seniority: string;
  businessUnit: string;
  hasCommitteeAssessment: boolean;
  committeeAssessment: any;
}

interface CollaboratorsResponse {
  cycle: string;
  phase: string;
  collaborators: CollaboratorForEqualization[];
  summary: {
    totalCollaborators: number;
    withCommitteeAssessment: number;
    pendingEqualization: number;
  };
}

interface CollaboratorEvaluationSummary {
  cycle: string;
  currentPhase?: string;
  collaborator: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    seniority: string;
  };
  evaluationScores: {
    selfAssessment: number | null;
    assessment360: number | null;
    managerAssessment: number | null;
    mentoring: number | null;
  };
  customSummary: string;
  // Avaliações recebidas
  selfAssessment: any;
  assessments360Received: any[];
  managerAssessmentsReceived: any[];
  mentoringAssessmentsReceived: any[];
  referenceFeedbacksReceived: any[];
  committeeAssessment: any;
  // Avaliações enviadas
  assessments360Sent?: any[];
  managerAssessmentsSent?: any[];
  mentoringAssessmentsSent?: any[];
  referenceFeedbacksSent?: any[];
  summary: {
    totalAssessmentsReceived: number;
    totalAssessmentsSent?: number;
    hasCommitteeAssessment: boolean;
    isEqualizationComplete: boolean;
  };
}

interface CommitteeMetrics {
  cycle: string;
  phase: string;
  deadlines: {
    assessment: string | null;
    manager: string | null;
    equalization: string | null;
    daysRemaining: number | null;
  };
  metrics: {
    totalCollaborators: number;
    selfAssessmentCompletion: number;
    assessment360Completion: number;
    managerAssessmentCompletion: number;
    committeeAssessmentCompletion: number;
    counts: {
      selfAssessments: number;
      assessments360: number;
      managerAssessments: number;
      committeeAssessments: number;
    };
  };
}

interface CreateCommitteeAssessment {
  evaluatedUserId: string;
  finalScore: number;
  justification: string;
  observations?: string;
}

interface UpdateCommitteeAssessment {
  finalScore?: number;
  justification?: string;
  observations?: string;
}

interface CommitteeAssessment {
  id: string;
  cycle: string;
  finalScore: number;
  justification: string;
  observations?: string;
  status: 'DRAFT' | 'SUBMITTED';
  createdAt: string;
  submittedAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  evaluatedUser: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    seniority: string;
  };
}

class CommitteeService {
  private readonly BASE_PATH = '/evaluations/committee';

  async getCollaboratorsForEqualization(): Promise<CollaboratorsResponse> {
    try {
      const response = await api.get<CollaboratorsResponse>(`${this.BASE_PATH}/collaborators`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores para equalização:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar colaboradores');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async getMetrics(): Promise<CommitteeMetrics> {
    try {
      const response = await api.get<CommitteeMetrics>(`${this.BASE_PATH}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas do comitê:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar métricas');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async getCollaboratorEvaluationSummary(collaboratorId: string): Promise<CollaboratorEvaluationSummary> {
    try {
      const response = await api.get<CollaboratorEvaluationSummary>(
        `${this.BASE_PATH}/collaborator/${collaboratorId}/summary`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo de avaliações:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar resumo de avaliações');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async createCommitteeAssessment(data: CreateCommitteeAssessment): Promise<CommitteeAssessment> {
    try {
      const response = await api.post<CommitteeAssessment>(`${this.BASE_PATH}/assessment`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação de comitê:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar avaliação');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async updateCommitteeAssessment(assessmentId: string, data: UpdateCommitteeAssessment): Promise<CommitteeAssessment> {
    try {
      const response = await api.put<CommitteeAssessment>(`${this.BASE_PATH}/assessment/${assessmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação de comitê:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar avaliação');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async submitCommitteeAssessment(assessmentId: string): Promise<CommitteeAssessment> {
    try {
      const response = await api.patch<CommitteeAssessment>(
        `${this.BASE_PATH}/assessment/${assessmentId}/submit`,
        { evaluationType: 'committee' }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao submeter avaliação de comitê:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao submeter avaliação');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async getAllCommitteeAssessments(): Promise<{
    cycle: string;
    phase: string;
    assessments: CommitteeAssessment[];
    summary: {
      total: number;
      draft: number;
      submitted: number;
    };
  }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/assessments`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avaliações de comitê:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async exportCollaboratorData(collaboratorId: string) {
    const response = await api.get(`/evaluations/committee/export/${collaboratorId}`);
    return response.data;
  }
}

export default new CommitteeService();
export type { 
  CollaboratorForEqualization, 
  CollaboratorsResponse, 
  CollaboratorEvaluationSummary,
  CommitteeMetrics,
  CreateCommitteeAssessment,
  UpdateCommitteeAssessment,
  CommitteeAssessment
}; 