import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import type { BrutalFactsMetricsDto, TeamAnalysisDto, TeamHistoricalPerformanceDto } from '../types/brutalFacts';
import { CreateManagerSubordinateAssessment } from '../types/evaluations';
import { DetailedSelfAssessment } from '../types/detailedEvaluations';

export interface Project {
  projectId: string;
  projectName: string;
}

/**
 * Representa a avaliação completa de um cliente para um ciclo de projeto,
 * incluindo a nota e o feedback (reason).
 */
export interface ClientEvaluation {
  cycle: string;
  score: number;
  justification: string;
}

class ManagerService {
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
      const response = await api.get<DetailedSelfAssessment>(
        `/evaluations/manager/subordinate/${subordinateId}/self-assessment`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        },
      );
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

  static async getReceived360Assessments(
    subordinateId: string | undefined,
    cycle: string,
  ): Promise<Received360Evaluation[]> {
    try {
      const response = await api.get<Received360Evaluation[]>(
        // URL com o ID do colaborador
        `/evaluations/manager/subordinate/${subordinateId}/360-assessments`,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
          params: {
            cycle,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações 360 para o usuário ${subordinateId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações 360.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getCollaboratorFullEvaluation(
    collaboratorId: string,
    cycle: string,
  ): Promise<CollaboratorFullEvaluation> {
    try {
      const response = await api.get<CollaboratorFullEvaluation>(`/evaluations/collaborator/cycle/${cycle}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          collaboratorId: collaboratorId,
        },
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

  static async getCollaboratorPerformanceHistory(subordinateId: string): Promise<PerformanceHistoryDto> {
    try {
      // O backend espera o ID do liderado para filtrar o histórico
      const response = await api.get<PerformanceHistoryDto>('/evaluations/manager/performance/history', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          subordinateId,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar histórico de performance para o colaborador ${subordinateId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar o histórico de performance.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getBrutalFactsMetrics(cycle: string): Promise<BrutalFactsMetricsDto> {
    try {
      const response = await api.get<BrutalFactsMetricsDto>('/evaluations/manager/brutal-facts-metrics', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          cycle,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas de Brutal Facts:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar métricas de Brutal Facts.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getTeamAnalysis(cycle: string): Promise<TeamAnalysisDto> {
    try {
      const response = await api.get<TeamAnalysisDto>('/evaluations/manager/team-analysis', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
        params: {
          cycle,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise da equipe:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar análise da equipe.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getTeamHistoricalPerformance(): Promise<TeamHistoricalPerformanceDto> {
    try {
      const response = await api.get<TeamHistoricalPerformanceDto>('/evaluations/manager/team-historical-performance', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar performance histórica da equipe:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar performance histórica da equipe.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  static async getCollaboratorProjects(subordinateId: string): Promise<Project[]> {
    try {
      // Endpoint ajustado conforme especificação para buscar projetos do usuário.
      const response = await api.get<Project[]>(`/users/${subordinateId}/projects`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar projetos para o colaborador ${subordinateId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar os projetos do colaborador.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca as avaliações completas do cliente (nota e feedback) para um projeto específico.
   * @param projectId O ID do projeto.
   * @returns Uma promessa que resolve para um array de avaliações de cliente.
   */
  static async getClientProjectEvaluations(projectId: string): Promise<ClientEvaluation[]> {
    try {
      // Endpoint atualizado conforme a especificação do backend
      const response = await api.get<ClientEvaluation[]>(`/evaluations/collaborator/projects/${projectId}/details`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações do cliente para o projeto ${projectId}:`, error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 404) return []; // Retorna array vazio se não houver avaliações
        throw new Error(error.response.data.message || 'Falha ao buscar as avaliações do cliente.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }
}

export default ManagerService;
