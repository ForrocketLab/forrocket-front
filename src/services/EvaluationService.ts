import api from '../api';
import AuthService from './AuthService'; 
import { AxiosError } from 'axios'; 

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
  private getToken(): string | null {
    return AuthService.getToken();
  }

  private getAuthHeaders() {
    const token = this.getToken();
    console.log(token);
    if (!token) {
      throw new Error('Nenhum token de autenticação encontrado. Faça login.');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Envia a autoavaliação para o back-end.
   * @param assessmentData Dados da autoavaliação a ser enviada.
   * @returns Resposta da API após a criação da autoavaliação.
   */
  async createSelfAssessment(assessmentData: CreateSelfAssessmentDto): Promise<SelfAssessmentResponse> {
    try {
      const response = await api.post<SelfAssessmentResponse>( 
        '/api/evaluations/collaborator/self-assessment', 
        assessmentData,
        {
          headers: this.getAuthHeaders(), 
        }
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
   * Busca todas as avaliações (incluindo autoavaliação) do usuário logado para um ciclo específico.
   * @param cycleId O ID do ciclo de avaliação (ex: "2025.1").
   * @returns Objeto contendo todas as avaliações do usuário para o ciclo.
   */
  async getUserEvaluationsByCycle(cycleId: string): Promise<UserEvaluationsByCycleResponse> { 
    try {
      debugger;
      const response = await api.get<UserEvaluationsByCycleResponse>(
        `/evaluations/collaborator/cycle/${cycleId}`, 
        {
          headers: this.getAuthHeaders(), 
        }
      );
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
}

export default new EvaluationService();