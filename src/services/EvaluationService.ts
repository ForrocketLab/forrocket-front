import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import type {
  EvaluableUsersResponse,
  Create360AssessmentPayload,
  CreateMentoringAssessmentPayload,
} from '../types/evaluations';

export interface CriterionDetails {
  score: number | null;
  justification: string;
}

export interface PostureCriteria {
  sentimentoDeDono: CriterionDetails;
  resilienciaNasAdversidades: CriterionDetails;
  organizacaoNoTrabalho: CriterionDetails;
  capacidadeDeAprender: CriterionDetails;
  serTeamPlayer: CriterionDetails;
}

export interface ExecutionCriteria {
  entregarComQualidade: CriterionDetails;
  atenderAosPrazos: CriterionDetails;
  fazerMaisComMenos: CriterionDetails;
  pensarForaDaCaixa: CriterionDetails;
}

export interface PeopleAndManagementCriteria {
  gente: CriterionDetails;
  resultados: CriterionDetails;
  evolucaoDaRocketCorp: CriterionDetails;
}

export interface CreateSelfAssessmentDto {
  cycleId: string;
  postureCriteria: PostureCriteria;
  executionCriteria: ExecutionCriteria;
  peopleAndManagementCriteria?: PeopleAndManagementCriteria;
}

export interface SelfAssessmentResponse {
  id: string;
  cycle: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  postureCriteria: PostureCriteria;
  executionCriteria: ExecutionCriteria;
  peopleAndManagementCriteria?: PeopleAndManagementCriteria;
}

export interface UserEvaluationsByCycleResponse {
  cycle: string;
  selfAssessment: SelfAssessmentResponse | null;
  assessments360: any[];
  mentoringAssessments: any[];
  referenceFeedbacks: any[];
  summary: {
    selfAssessmentCompleted: boolean;
    assessments360Count: number;
    mentoringAssessmentsCount: number;
    referenceFeedbacksCount: number;
  };
}

class EvaluationService {
  private getToken(): string {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Nenhum token de autenticação encontrado.');
    }
    return token;
  }

  async getEvaluableUsers(): Promise<EvaluableUsersResponse> {
    try {
      const response = await api.get<EvaluableUsersResponse>('/projects/evaluable-users', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários avaliáveis:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      throw new Error('Falha ao buscar usuários avaliáveis.');
    }
  }

  async create360Assessment(payload: Create360AssessmentPayload): Promise<void> {
    try {
      await api.post('/evaluations/collaborator/360-assessment', payload, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Erro ao criar avaliação 360:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar avaliação 360.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async createMentoringAssessment(payload: CreateMentoringAssessmentPayload): Promise<void> {
    try {
      await api.post('/evaluations/collaborator/mentoring-assessment', payload, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Erro ao criar avaliação de mentoring:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar avaliação de mentoring.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Envia a autoavaliação para o back-end.
   * @param assessmentData Dados da autoavaliação a ser enviada.
   * @returns Resposta da API após a criação da autoavaliação.
   */
  async createSelfAssessment(assessmentData: CreateSelfAssessmentDto): Promise<SelfAssessmentResponse> {
    try {
      const response = await api.post<SelfAssessmentResponse>(
        '/evaluations/collaborator/self-assessment',
        assessmentData,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        },
      );
      console.log('Autoavaliação criada/atualizada com sucesso!', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar/enviar autoavaliação:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao enviar autoavaliação.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Atualiza incrementalmente uma autoavaliação existente
   * @param updateData Dados parciais para atualizar na autoavaliação
   * @returns Promise que resolve quando a atualização é bem-sucedida
   */
  async updateSelfAssessment(updateData: Record<string, any>): Promise<void> {
    try {
      // Garantir que todos os campos necessários estejam presentes
      const sanitizedData = Object.entries(updateData).reduce((acc, [key, value]) => {
        // Se for um score, garantir que seja um número válido (>= 1)
        if (key.endsWith('Score')) {
          const score = Number(value);
          if (!isNaN(score) && score >= 1) {
            acc[key] = score;
          }
        }
        // Se for uma justification, garantir que seja uma string não-vazia
        else if (key.endsWith('Justification')) {
          const justification = String(value || '').trim();
          if (justification) {
            acc[key] = justification;
          }
        }
        // Outros campos mantém o valor original
        else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Se não houver dados para atualizar, retornar
      if (Object.keys(sanitizedData).length === 0) {
        console.log('🤷‍♂️ Nenhum dado válido para atualizar');
        return;
      }

      // Adicionar cycleId se não existir
      if (!sanitizedData.cycleId) {
        sanitizedData.cycleId = '2025.1';
      }

      console.log('🧹 Dados sanitizados para envio:', sanitizedData);

      try {
        // Tenta atualizar primeiro
        await api.patch('/evaluations/collaborator/self-assessment', sanitizedData);
        console.log('📊 Autoavaliação atualizada com sucesso');
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          // Se não existir, tenta criar
          console.log('🆕 Autoavaliação não existe, criando...');
          await api.post('/evaluations/collaborator/self-assessment', sanitizedData);
          console.log('✨ Autoavaliação criada com sucesso');
        } else {
          throw error;
        }
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error('❌ Erro ao atualizar autoavaliação:', error);
      if (error.response) {
        console.error('Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
      const errorMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'Falha ao atualizar autoavaliação.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca todas as avaliações (incluindo autoavaliação) do usuário logado para um ciclo específico.
   * @param cycleId O ID do ciclo de avaliação (ex: "2025.1").
   * @returns Objeto contendo todas as avaliações do usuário para o ciclo.
   */
  async getUserEvaluationsByCycle(cycleId: string): Promise<UserEvaluationsByCycleResponse> {
    try {
      const response = await api.get<UserEvaluationsByCycleResponse>(`/evaluations/collaborator/cycle/${cycleId}`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      console.log(`Avaliações para o ciclo ${cycleId} carregadas com sucesso!`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar avaliações para o ciclo ${cycleId}:`, error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          AuthService.logout();
          throw new Error('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        }
        throw new Error(error.response.data.message || 'Falha ao buscar avaliações.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async getPerformanceHistory(): Promise<PerformanceHistoryDto> {
    try {
      const response = await api.get<PerformanceHistoryDto>('/evaluations/collaborator/performance/history', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Histórico de performance carregado com sucesso!', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de performance:', error);

      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 401) {
          AuthService.logout();
          throw new Error('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        }
        throw new Error(error.response.data.message || 'Falha ao buscar o histórico de performance.');
      }

      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }
}

export default new EvaluationService();
