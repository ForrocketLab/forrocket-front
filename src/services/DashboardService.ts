import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import { type DetailedSelfAssessment, type CreateManagerSubordinateAssessment, type ManagerAssessmentCriterion } from '../types/detailedEvaluations'; // Importa o novo tipo

interface CollaboratorFullEvaluation {
  cycle: string;
  selfAssessment: any | null;
  assessments360: any[];
  mentoringAssessments: any[];
  referenceFeedbacks: any[];
  managerAssessments: {
    id: string;
    cycle: string;
    authorId: string;
    evaluatedUserId: string;
    status: 'DRAFT' | 'SUBMITTED';
    createdAt: string;
    updatedAt: string;
    submittedAt: string | null;
    evaluatedUser: any;
    answers: ManagerAssessmentCriterion[];
  }[];
  summary: any;
}


class DashboardService {

  static async getManagerDashboard(cycle: string): Promise<ManagerDashboardResponse> {
    try {
      const response = await api.get<ManagerDashboardResponse>('/evaluations/manager/dashboard', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          cycle,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard do gestor:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar dados do dashboard.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getActiveCycle(): Promise<ActiveCycle> {
    try {
      const response = await api.get<ActiveCycle>('/evaluation-cycles/active', {
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

  static async getDetailedSelfAssessment(subordinateId: string): Promise<DetailedSelfAssessment> {
    try {
      const response = await api.get<DetailedSelfAssessment>(`/evaluations/manager/subordinate/${subordinateId}/self-assessment`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar autoavaliação detalhada para ${subordinateId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar autoavaliação detalhada.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async submitManagerSubordinateAssessment(payload: CreateManagerSubordinateAssessment): Promise<void> {
    try {
      await api.post('/evaluations/manager/subordinate-assessment', payload);
    } catch (error) {
      console.error('Erro ao enviar avaliação do gestor:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao enviar avaliação do gestor.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getCollaboratorFullEvaluation(collaboratorId: string, cycle: string): Promise<CollaboratorFullEvaluation> {
    try {
      const response = await api.get<CollaboratorFullEvaluation>(`/evaluations/collaborator/cycle/${cycle}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          collaboratorId: collaboratorId
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliação completa para o colaborador ${collaboratorId} no ciclo ${cycle}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliação completa do colaborador.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }
}

export default DashboardService;