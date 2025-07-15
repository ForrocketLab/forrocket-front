import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import type {
  EvaluableUsersResponse,
  Create360AssessmentPayload,
  CreateMentoringAssessmentPayload,
} from '../types/evaluations';

export interface CriteriaDto {
  id: string;
  name: string;
  description: string;
  pillar: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight: number;
  isRequired: boolean;
  createdAt: Record<string, unknown>;
  updatedAt: Record<string, unknown>;
}

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
  assessments360: Array<{
    evaluatedUserId: string;
    evaluatedUserName: string;
    evaluatedUserEmail: string;
    evaluatedUserJobTitle: string;
    evaluatedUserSeniority: string;
    evaluatedUserRoles: string[];
    overallScore: number;
    strengths: string;
    improvements: string;
    status: string;
  }>;
  mentoringAssessments: any[];
  referenceFeedbacks: any[];
  summary: {
    selfAssessmentCompleted: boolean;
    assessments360Count: number;
    mentoringAssessmentsCount: number;
    referenceFeedbacksCount: number;
  };
}

export enum WorkAgainMotivation {
  STRONGLY_DISAGREE = 'STRONGLY_DISAGREE', // Discordo Totalmente
  PARTIALLY_DISAGREE = 'PARTIALLY_DISAGREE', // Discordo Parcialmente
  NEUTRAL = 'NEUTRAL', // Neutro
  PARTIALLY_AGREE = 'PARTIALLY_AGREE', // Concordo Parcialmente
  STRONGLY_AGREE = 'STRONGLY_AGREE', // Concordo Totalmente
}

export interface EvaluableColleague {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  seniority: string;
  businessUnit?: string;
  existingEvaluation?: {
    overallScore: number;
    strengths: string;
    improvements: string;
    workAgainMotivation: WorkAgainMotivation;
    status: string;
  };
}

export interface ProjectCollaborator360 {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  strengths: string;
  improvements: string;
  workAgainMotivation: WorkAgainMotivation;
}

export interface MentorAssessment {
  id: string;
  mentorName: string;
  mentorRole: string;
  mentorInitials: string;
  rating: number;
  justification: string;
}

export interface ReferenceAssessmentDto {
  id: string;
  referenceName: string;
  referenceRole: string;
  referenceInitials: string;
  justification: string;
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
      const sanitizedData = Object.entries(updateData).reduce(
        (acc, [key, value]) => {
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
        },
        {} as Record<string, any>,
      );

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
      const errorMessage =
        error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : 'Falha ao atualizar autoavaliação.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza incrementalmente uma avaliação 360 existente
   * @param updateData Dados parciais para atualizar na avaliação 360
   * @returns Promise que resolve quando a atualização é bem-sucedida
   */
  async updateEvaluation360(updateData: Record<string, any>): Promise<void> {
    try {
      // Garantir que todos os campos necessários estejam presentes
      const sanitizedData = Object.entries(updateData).reduce(
        (acc, [key, value]) => {
          // Se for um score, garantir que seja um número válido (entre 1 e 5)
          if (key === 'overallScore') {
            const score = Number(value);
            if (!isNaN(score) && score >= 1 && score <= 5) {
              acc[key] = score;
            } else {
              console.warn(`⚠️ Score inválido (${value}), deve ser entre 1 e 5`);
            }
          }
          // Se for uma string, garantir que seja não-vazia
          else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed) {
              acc[key] = trimmed;
            } else {
              console.warn(`⚠️ Campo ${key} vazio ou inválido`);
            }
          }
          // Outros campos mantém o valor original
          else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      // Validar campos obrigatórios
      const requiredFields = ['evaluatedUserId', 'cycleId'];
      const missingFields = requiredFields.filter(field => !sanitizedData[field]);

      if (missingFields.length > 0) {
        console.warn('⚠️ Campos obrigatórios faltando:', missingFields);
        return;
      }

      // Se não houver dados para atualizar, retornar
      if (Object.keys(sanitizedData).length === 0) {
        console.log('🤷‍♂️ Nenhum dado válido para atualizar');
        return;
      }

      // Adicionar cycleId se não existir
      if (!sanitizedData.cycleId) {
        sanitizedData.cycleId = '2025.1';
      }

      // Validar campos opcionais
      if ('overallScore' in updateData && !('overallScore' in sanitizedData)) {
        console.warn('⚠️ Score inválido, pulando atualização');
        return;
      }

      if ('strengths' in updateData && !sanitizedData.strengths) {
        console.warn('⚠️ Campo strengths vazio, pulando atualização');
        return;
      }

      if ('improvements' in updateData && !sanitizedData.improvements) {
        console.warn('⚠️ Campo improvements vazio, pulando atualização');
        return;
      }

      console.log('🧹 Dados sanitizados para envio:', sanitizedData);

      // Primeiro, verificar se a avaliação já existe
      try {
        const existingEvaluation = await this.getEvaluation360(sanitizedData.evaluatedUserId);

        if (existingEvaluation) {
          // Se existe, atualizar
          await api.patch('/evaluations/collaborator/360-assessment', sanitizedData);
          console.log('📊 Avaliação 360 atualizada com sucesso');
        } else {
          // Se não existe, criar
          await api.post('/evaluations/collaborator/360-assessment', sanitizedData);
          console.log('✨ Avaliação 360 criada com sucesso');
        }
      } catch (err) {
        const error = err as AxiosError;
        console.error('❌ Erro ao processar avaliação 360:', error);

        if (error.response) {
          console.error('Detalhes do erro:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        }

        // Se for erro de validação (400), mostrar mensagem mais amigável
        if (error.response?.status === 400) {
          const data = error.response.data as any;
          const message = data?.message || 'Dados inválidos';
          throw new Error(Array.isArray(message) ? message.join(', ') : message);
        }

        throw error;
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error('❌ Erro ao processar avaliação 360:', error);
      if (error.response) {
        console.error('Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
      const errorMessage =
        error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : 'Falha ao processar avaliação 360.';
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

  /**
   * Busca uma avaliação 360 existente para um colaborador específico
   * @param evaluatedUserId ID do usuário avaliado
   * @returns Dados da avaliação 360 ou null se não existir
   */
  async getEvaluation360(evaluatedUserId: string): Promise<any> {
    try {
      const response = await api.get(`/evaluations/collaborator/360-assessment/${evaluatedUserId}`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      // Mapear os dados do backend para o formato do frontend
      if (response.data) {
        return {
          evaluatedUserId: response.data.evaluatedUserId,
          evaluatedUserName: response.data.evaluatedUserName,
          evaluatedUserEmail: response.data.evaluatedUserEmail,
          evaluatedUserJobTitle: response.data.evaluatedUserJobTitle,
          evaluatedUserSeniority: response.data.evaluatedUserSeniority,
          evaluatedUserRoles: response.data.evaluatedUserRoles || [],
          overallScore: response.data.overallScore || null,
          strengths: response.data.strengths || '',
          improvements: response.data.improvements || '',
          status: response.data.status || 'PENDING',
        };
      }
      return null;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMentoringAssessment(mentorId: string): Promise<any> {
    try {
      const response = await api.get(`/evaluations/collaborator/mentoring-assessment?mentorId=${mentorId}`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avaliação de mentoring:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      throw new Error('Falha ao buscar avaliação de mentoring.');
    }
  }

  async updateMentoringAssessment(mentorId: string, cycleId: string, updateData: Record<string, any>): Promise<any> {
    try {
      const payload = {
        mentorId,
        cycleId,
        ...updateData,
      };

      const response = await api.patch('/evaluations/collaborator/mentoring-assessment', payload, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação de mentoring:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar avaliação de mentoring.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca avaliações de mentoria
   * @returns Lista de mentores para avaliação
   */
  async getMentorAssessments(): Promise<MentorAssessment[]> {
    try {
      const response = await api.get('/evaluations/collaborator/mentor-assessment', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Avaliações de mentoria carregadas:', response.data);

      // Se o backend retorna um único objeto, transformar em array
      if (response.data && !Array.isArray(response.data)) {
        return [response.data];
      }

      // Se já é um array, retornar como está
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações de mentoria:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      throw new Error('Erro ao carregar avaliações de mentoria.');
    }
  }

  /**
   * Atualiza uma avaliação de mentoria
   * @param updateData Dados para atualizar
   * @returns Promise que resolve quando a atualização é bem-sucedida
   */
  async updateMentorAssessment(updateData: { rating?: number; justification?: string }): Promise<void> {
    try {
      // Payload conforme especificado na API
      const payload = {
        ...updateData,
      };

      await api.patch('/evaluations/collaborator/mentor-assessment', payload, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Avaliação de mentoria atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar avaliação de mentoria:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar avaliação de mentoria.');
      }

      throw new Error('Erro ao atualizar avaliação de mentoria.');
    }
  }

  async getActiveCycle(): Promise<{ name: string }> {
    try {
      const response = await api.get('/evaluation-cycles/active', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });
      return { name: response.data.name };
    } catch (error) {
      console.error('Erro ao buscar ciclo ativo:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      throw new Error('Falha ao buscar ciclo ativo.');
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

  /**
   * Busca todos os critérios de avaliação disponíveis
   * @returns Lista de critérios organizados por pilares
   */
  async getCriteria(): Promise<CriteriaDto[]> {
    try {
      const response = await api.get<CriteriaDto[]>('/public/criteria/for-user');
      console.log('Critérios carregados com sucesso!', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar critérios:', error);

      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar critérios de avaliação.');
      }

      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca a autoavaliação existente do usuário para o ciclo ativo
   * @returns Dados da autoavaliação no formato { [criterionId]: { score, justification } } ou null se não existir
   */
  async getSelfAssessment(): Promise<Record<string, { score: number; justification: string }> | null> {
    try {
      const response = await api.get('/evaluations/collaborator/self-assessment', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Autoavaliação existente carregada:', response.data);

      // O backend já retorna no formato correto { [criterionId]: { score, justification } }
      // Remover cycleId se existir, pois não é necessário para o formulário
      const assessmentData = { ...response.data };
      delete assessmentData.cycleId;

      return assessmentData;
    } catch (error) {
      console.error('Erro ao buscar autoavaliação existente:', error);

      if (error instanceof AxiosError && error.response?.status === 404) {
        // Não existe autoavaliação ainda, retornar null
        return null;
      }

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      throw new Error('Erro ao carregar autoavaliação existente.');
    }
  }

  /**
   * Salva ou atualiza a autoavaliação no formato dinâmico
   * @param assessmentData Dados da autoavaliação no formato { [criterionId]: { score, justification } }
   * @returns Promise que resolve quando a operação é bem-sucedida
   */
  async saveSelfAssessment(assessmentData: Record<string, { score: number; justification: string }>): Promise<void> {
    try {
      // Payload para o backend (incluindo cycleId)
      const payload = {
        cycleId: '2025.1',
        ...assessmentData,
      };

      console.log('Enviando autoavaliação com dados:', payload);

      try {
        // Tenta atualizar primeiro
        await api.patch('/evaluations/collaborator/self-assessment', payload, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
        console.log('✅ Autoavaliação atualizada com sucesso');
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          // Se não existir, tenta criar
          console.log('🆕 Autoavaliação não existe, criando...');
          await api.post('/evaluations/collaborator/self-assessment', payload, {
            headers: {
              Authorization: `Bearer ${this.getToken()}`,
            },
          });
          console.log('✨ Autoavaliação criada com sucesso');
        } else {
          throw error;
        }
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error('❌ Erro ao salvar autoavaliação:', error);

      if (error.response) {
        console.error('Detalhes do erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      const errorMessage =
        error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : 'Falha ao salvar autoavaliação.';

      throw new Error(errorMessage);
    }
  }

  /**
   * Busca todos os colaboradores que podem ser avaliados pelo usuário atual em avaliações 360
   * @returns Lista de colaboradores avaliáveis com suas avaliações existentes
   */
  async getEvaluableColleagues(): Promise<EvaluableColleague[]> {
    try {
      const response = await api.get('/evaluations/collaborator/360-assessment/evaluable-collaborators', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Colaboradores avaliáveis carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores avaliáveis:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      throw new Error('Erro ao carregar colaboradores avaliáveis.');
    }
  }

  /**
   * Busca colaboradores do projeto para avaliação 360 (novo endpoint)
   * @returns Lista de colaboradores do projeto com dados de avaliação
   */
  async getProjectCollaborators360(): Promise<ProjectCollaborator360[]> {
    try {
      const response = await api.get('/evaluations/collaborator/project-collaborators-360', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Colaboradores do projeto carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores do projeto:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      throw new Error('Erro ao carregar colaboradores do projeto.');
    }
  }

  /**
   * Busca feedbacks de referência
   * @returns Lista de referências para avaliação
   */
  async getReferenceFeedbacks(): Promise<ReferenceAssessmentDto[]> {
    try {
      const response = await api.get('/evaluations/collaborator/reference-feedbacks', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Feedbacks de referência carregados:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar feedbacks de referência:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        // Se não há referências ainda, retornar array vazio
        console.log('Nenhuma referência encontrada, retornando array vazio');
        return [];
      }

      throw new Error('Erro ao carregar feedbacks de referência.');
    }
  }

  /**
   * Salva todas as referências de uma vez (operação atômica)
   * @param references Lista de referências para salvar
   * @returns Promise que resolve quando o salvamento é bem-sucedido
   */
  async saveAllReferenceFeedbacks(references: ReferenceAssessmentDto[]): Promise<void> {
    try {
      const payload = {
        references,
      };

      await api.patch('/evaluations/collaborator/reference-feedbacks/batch', payload, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Todas as referências salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar feedbacks de referência:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao salvar feedbacks de referência.');
      }

      throw new Error('Erro ao salvar feedbacks de referência.');
    }
  }

  /**
   * Busca colaboradores disponíveis para seleção como referência
   * @returns Lista de colaboradores disponíveis
   */
  async getAvailableCollaborators(): Promise<{ id: string; name: string; email: string }[]> {
    try {
      const response = await api.get('/evaluations/collaborator/available-collaborators', {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      console.log('Colaboradores disponíveis carregados:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar colaboradores disponíveis:', error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        AuthService.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }

      // Se não há endpoint específico, usar colaboradores do projeto como fallback
      console.log('Endpoint não disponível, usando colaboradores do projeto como fallback');
      try {
        const projectCollaborators = await this.getProjectCollaborators360();
        return projectCollaborators.map((collab: ProjectCollaborator360) => ({
          id: collab.id,
          name: collab.name,
          email: `${collab.name.toLowerCase().replace(/\s+/g, '.')}@email.com`, // Email simulado
        }));
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        throw new Error('Erro ao carregar colaboradores disponíveis.');
      }
    }
  }
}

export default new EvaluationService();
