import api from '../api';

export interface PersonalInsightsRequest {
  collaboratorId: string;
  cycle: string;
}

export interface PersonalInsightsResponse {
  collaboratorId: string;
  collaboratorName: string;
  jobTitle: string;
  cycle: string;
  averageScore: number;
  insights: string;
  generatedAt: string;
}

class PersonalInsightsService {
  /**
   * Gera insights personalizados para um colaborador em um ciclo específico
   */
  async generatePersonalInsights(request: PersonalInsightsRequest): Promise<PersonalInsightsResponse> {
    const response = await api.post('/gen-ai/personal-insights', request);
    return response.data;
  }

  /**
   * Verifica se já existe insight gerado para o colaborador no ciclo
   */
  async getExistingPersonalInsight(collaboratorId: string, cycle: string): Promise<PersonalInsightsResponse | null> {
    try {
      const response = await api.get(`/gen-ai/personal-insights/${collaboratorId}/${cycle}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default new PersonalInsightsService(); 