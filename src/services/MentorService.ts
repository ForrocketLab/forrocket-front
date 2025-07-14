import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';

// =============================================
// INTERFACES E DTOs PARA MENTOR SERVICE
// =============================================

/**
 * Dashboard principal do mentor - dados de resumo
 */
export interface MentorDashboardResponse {
  summary: MentorDashboardSummary;
  mentoredCollaborators: MentoredCollaborator[];
  cycle: string;
  phase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
}

/**
 * Resumo com métricas principais do mentor
 */
export interface MentorDashboardSummary {
  mentoringAssessmentAverage: number | null;
  pendingReviews: number;
  totalMentoredCollaborators: number;
  completionPercentage: number;
}

/**
 * Colaborador mentorado - estrutura real da API
 */
export interface MentoredCollaborator {
  collaboratorId: string;
  collaboratorName: string;
  collaboratorEmail: string;
  jobTitle: string;
  seniority: string;
  mentorAssessmentStatus: 'PENDING' | 'DRAFT' | 'SUBMITTED';
  selfAssessmentAverage: number | null;
  managerAssessmentAverage: number | null;
  initials: string;
}

/**
 * Avaliação 360 recebida por um mentorado
 */
export interface MenteeAssessment360 {
  id: string;
  evaluatorName: string;
  evaluatorJobTitle: string;
  overallScore: number;
  strengths: string;
  improvements: string;
  submittedAt: string;
  cycle: string;
}

/**
 * Métricas de performance de um mentorado
 */
export interface MenteePerformanceMetrics {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  selfAssessmentScore: number | null;
  managerAssessmentScore: number | null;
  assessment360Average: number | null;
  mentoringScore: number | null;
  finalScore: number | null;
  lastUpdated: string;
}

/**
 * Médias por ciclo de um mentorado
 */
export interface MenteeCycleMeans {
  collaboratorId: string;
  collaboratorName: string;
  cycleAverages: CycleAverage[];
}

export interface CycleAverage {
  cycle: string;
  selfAssessmentAverage: number | null;
  managerAssessmentAverage: number | null;
  assessment360Average: number | null;
  mentoringAverage: number | null;
  finalAverage: number | null;
}

/**
 * Performance completa de um mentorado
 */
export interface MenteeCompletePerformance {
  collaborator: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    seniority: string;
    businessUnit: string;
  };
  currentCycle: string;
  performanceData: PerformanceHistoryDto;
  trends: {
    improving: boolean;
    declining: boolean;
    stable: boolean;
    overallTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  };
  recommendations: string[];
}

/**
 * Estruturas auxiliares para avaliações
 */
export interface AssessmentBase {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorJobTitle: string;
  submittedAt: string;
  cycle: string;
}

export interface Assessment360Detail extends AssessmentBase {
  overallScore: number;
  strengths: string;
  improvements: string;
}

export interface ManagerAssessmentDetail extends AssessmentBase {
  answers: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    justification: string;
  }>;
  averageScore: number;
}

export interface MentoringAssessmentDetail extends AssessmentBase {
  score: number;
  justification: string;
}

export interface ReferenceFeedbackDetail extends AssessmentBase {
  topic: string;
  feedback: string;
  rating?: number;
}

/**
 * Avaliações recebidas e enviadas por um mentorado
 */
export interface MenteeAssessments {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  assessmentsReceived: {
    selfAssessment: MenteeSelfAssessment | null;
    assessments360: Assessment360Detail[];
    managerAssessments: ManagerAssessmentDetail[];
    mentoringAssessments: MentoringAssessmentDetail[];
    referenceFeedbacks: ReferenceFeedbackDetail[];
  };
  assessmentsSent: {
    assessments360: Assessment360Detail[];
    referenceFeedbacks: ReferenceFeedbackDetail[];
  };
}

/**
 * Autoavaliação de um mentorado
 */
export interface MenteeSelfAssessment {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt: string | null;
  answers: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    justification: string;
  }>;
  averageScore: number;
}

/**
 * Avaliações de gestor recebidas por um mentorado
 */
export interface MenteeManagerAssessments {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  managerAssessments: Array<{
    id: string;
    managerId: string;
    managerName: string;
    managerJobTitle: string;
    status: 'DRAFT' | 'SUBMITTED';
    submittedAt: string | null;
    answers: Array<{
      criterionId: string;
      criterionName: string;
      score: number;
      justification: string;
    }>;
    averageScore: number;
  }>;
}

/**
 * Feedback 360 detalhado de um mentorado
 */
export interface MenteeFeedback360 {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  feedback360: Array<{
    id: string;
    evaluatorId: string;
    evaluatorName: string;
    evaluatorJobTitle: string;
    overallScore: number;
    strengths: string;
    improvements: string;
    submittedAt: string;
  }>;
  averageScore: number | null;
  totalFeedbacks: number;
}

// =============================================
// MENTOR SERVICE CLASS
// =============================================

/**
 * Serviço para operações relacionadas ao módulo de mentoria
 * Segue o padrão estabelecido pelo ManagerService
 */
class MentorService {
  /**
   * Busca o dashboard principal do mentor
   * @param cycle Ciclo de avaliação
   * @returns Dados do dashboard do mentor
   */
  static async getMentorDashboard(cycle?: string): Promise<MentorDashboardResponse> {
    try {
      const response = await api.get<MentorDashboardResponse>('/mentor/dashboard', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: cycle ? { cycle } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard do mentor:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar dados do dashboard do mentor.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca a lista de colaboradores mentorados
   * @returns Lista de colaboradores mentorados
   */
  static async getMentoredCollaborators(): Promise<MentoredCollaborator[]> {
    try {
      const response = await api.get<MentoredCollaborator[]>('/mentor/mentored-collaborators', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores mentorados:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar colaboradores mentorados.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca avaliações 360 recebidas por um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Avaliações 360 do mentorado
   */
  static async getMentee360Assessments(collaboratorId: string, cycle?: string): Promise<MenteeAssessment360[]> {
    try {
      const response = await api.get<MenteeAssessment360[]>(`/mentor/collaborator/${collaboratorId}/360-assessments`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: cycle ? { cycle } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações 360 para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações 360 do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca métricas de performance de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Métricas de performance do mentorado
   */
  static async getMenteePerformanceMetrics(collaboratorId: string, cycle?: string): Promise<MenteePerformanceMetrics> {
    try {
      const response = await api.get<MenteePerformanceMetrics>(
        `/mentor/collaborator/${collaboratorId}/performance-metrics`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
          params: cycle ? { cycle } : undefined,
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar métricas de performance para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar métricas de performance do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca médias por ciclo de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @returns Médias por ciclo do mentorado
   */
  static async getMenteeCycleMeans(collaboratorId: string): Promise<MenteeCycleMeans> {
    try {
      const response = await api.get<MenteeCycleMeans>(`/mentor/collaborator/${collaboratorId}/cycle-means`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar médias por ciclo para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar médias por ciclo do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca a performance completa de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @returns Performance completa do mentorado
   */
  static async getMenteeCompletePerformance(collaboratorId: string): Promise<MenteeCompletePerformance> {
    try {
      const response = await api.get<MenteeCompletePerformance>(
        `/mentor/collaborator/${collaboratorId}/complete-performance`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar performance completa para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar performance completa do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca todas as avaliações (recebidas e enviadas) de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Avaliações do mentorado
   */
  static async getMenteeAssessments(collaboratorId: string, cycle?: string): Promise<MenteeAssessments> {
    try {
      const response = await api.get<MenteeAssessments>(`/mentor/collaborator/${collaboratorId}/assessments`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: cycle ? { cycle } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca a autoavaliação de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Autoavaliação do mentorado
   */
  static async getMenteeSelfAssessment(collaboratorId: string, cycle?: string): Promise<MenteeSelfAssessment> {
    try {
      const response = await api.get<MenteeSelfAssessment>(`/mentor/collaborator/${collaboratorId}/self-assessment`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: cycle ? { cycle } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar autoavaliação para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar autoavaliação do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca avaliações de gestores recebidas por um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Avaliações de gestores do mentorado
   */
  static async getMenteeManagerAssessments(collaboratorId: string, cycle?: string): Promise<MenteeManagerAssessments> {
    try {
      const response = await api.get<MenteeManagerAssessments>(
        `/mentor/collaborator/${collaboratorId}/manager-assessments`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
          params: cycle ? { cycle } : undefined,
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações de gestores para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações de gestores do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca feedback 360 detalhado de um mentorado específico
   * @param collaboratorId ID do colaborador mentorado
   * @param cycle Ciclo de avaliação (opcional)
   * @returns Feedback 360 do mentorado
   */
  static async getMenteeFeedback360(collaboratorId: string, cycle?: string): Promise<MenteeFeedback360> {
    try {
      const response = await api.get<MenteeFeedback360>(`/mentor/collaborator/${collaboratorId}/feedback-360`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: cycle ? { cycle } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar feedback 360 para o mentorado ${collaboratorId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar feedback 360 do mentorado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca o ciclo ativo para uso geral
   * @returns Dados do ciclo ativo
   */
  static async getActiveCycle(): Promise<{ id: string; name: string; status: string; phase: string }> {
    try {
      const response = await api.get('/evaluation-cycles/active', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ciclo ativo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar ciclo ativo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca todos os ciclos disponíveis
   * @returns Lista de todos os ciclos
   */
  static async getAllCycles(): Promise<{ id: string; name: string; status: string; phase: string }[]> {
    try {
      const response = await api.get('/evaluation-cycles', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os ciclos:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar ciclos.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }
}

export default MentorService;
