import api from '../api';

export interface ClimateAssessmentData {
  id: string;
  cycle: string;
  status: 'DRAFT' | 'SUBMITTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  answers: ClimateAssessmentAnswer[];
}

export interface ClimateAssessmentAnswer {
  id: string;
  criterionId: string;
  score: number;
  justification: string;
}

export interface CreateClimateAssessmentRequest {
  relacionamentoLiderancaScore: number;
  relacionamentoLiderancaJustification: string;
  relacionamentoColegasScore: number;
  relacionamentoColegasJustification: string;
  reconhecimentoValorizacaoScore: number;
  reconhecimentoValorizacaoJustification: string;
  cargaTrabalhoEquilibrioScore: number;
  cargaTrabalhoEquilibrioJustification: string;
}

export interface UpdateClimateAssessmentRequest {
  relacionamentoLiderancaScore?: number;
  relacionamentoLiderancaJustification?: string;
  relacionamentoColegasScore?: number;
  relacionamentoColegasJustification?: string;
  reconhecimentoValorizacaoScore?: number;
  reconhecimentoValorizacaoJustification?: string;
  cargaTrabalhoEquilibrioScore?: number;
  cargaTrabalhoEquilibrioJustification?: string;
}

export interface ClimateAssessmentConfig {
  id: string;
  cycle: string;
  isActive: boolean;
  activatedBy: string;
  activatedByUserName: string;
  activatedAt: string;
  deactivatedAt?: string;
}

export interface ClimateAssessmentStats {
  cycle: string;
  totalAssessments: number;
  submittedAssessments: number;
  draftAssessments: number;
  eligibleUsers: number;
  completionRate: number;
  criteriaStats: {
    [key: string]: {
      total: number;
      count: number;
      average: number;
    };
  };
}

export interface ClimateSentimentAnalysis {
  sentimentAnalysis: string;
  improvementTips: string;
  strengths: string;
  areasOfConcern: string;
  overallSentimentScore: number;
  cycle: string;
  totalAssessments: number;
  generatedAt: string;
}

class ClimateService {
  /**
   * Criar avaliação de clima organizacional
   */
  async createClimateAssessment(data: CreateClimateAssessmentRequest): Promise<ClimateAssessmentData> {
    const response = await api.post('/evaluations/climate', data);
    return response.data;
  }

  /**
   * Atualizar avaliação de clima organizacional
   */
  async updateClimateAssessment(data: UpdateClimateAssessmentRequest): Promise<ClimateAssessmentData> {
    const response = await api.put('/evaluations/climate', data);
    return response.data;
  }

  /**
   * Buscar avaliação de clima organizacional do usuário
   */
  async getClimateAssessment(): Promise<ClimateAssessmentData | null> {
    try {
      const response = await api.get('/evaluations/climate');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Submeter avaliação de clima organizacional
   */
  async submitClimateAssessment(): Promise<ClimateAssessmentData> {
    const response = await api.post('/evaluations/climate/submit');
    return response.data;
  }

  /**
   * Configurar avaliação de clima organizacional (apenas RH)
   */
  async configureClimateAssessment(isActive: boolean): Promise<ClimateAssessmentConfig> {
    const response = await api.post('/evaluations/climate/config', { isActive });
    return response.data;
  }

  /**
   * Buscar configuração da avaliação de clima
   */
  async getClimateAssessmentConfig(): Promise<ClimateAssessmentConfig | null> {
    try {
      const response = await api.get('/evaluations/climate/config');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Buscar estatísticas da avaliação de clima (apenas RH)
   */
  async getClimateAssessmentStats(): Promise<ClimateAssessmentStats> {
    const response = await api.get('/evaluations/climate/stats');
    return response.data;
  }

  /**
   * Gerar análise de sentimento da avaliação de clima (apenas RH)
   */
  async generateClimateSentimentAnalysis(): Promise<ClimateSentimentAnalysis> {
    const response = await api.post('/evaluations/climate/sentiment-analysis');
    return response.data;
  }

  /**
   * Buscar análise de sentimento já gerada (apenas RH)
   */
  async getExistingClimateSentimentAnalysis(): Promise<ClimateSentimentAnalysis | null> {
    const response = await api.get('/evaluations/climate/sentiment-analysis');
    return response.data || null;
  }

  /**
   * Buscar todos os ciclos com avaliação de clima
   */
  async getClimateCycles(): Promise<string[]> {
    const response = await api.get('/evaluations/climate/cycles');
    return response.data;
  }

  /**
   * Buscar estatísticas da avaliação de clima para um ciclo específico
   */
  async getClimateAssessmentStatsByCycle(cycle: string): Promise<ClimateAssessmentStats> {
    const response = await api.get('/evaluations/climate/stats', { params: { cycle } });
    return response.data;
  }

  /**
   * Buscar análise de sentimento para um ciclo específico
   */
  async getClimateSentimentAnalysisByCycle(cycle: string): Promise<ClimateSentimentAnalysis | null> {
    const response = await api.get('/evaluations/climate/sentiment-analysis', { params: { cycle } });
    return response.data || null;
  }
}

export default new ClimateService(); 