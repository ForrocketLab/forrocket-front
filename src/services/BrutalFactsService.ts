import type { BrutalFactsMetricsDto, TeamAnalysisDto } from '../types/brutalFacts';

const API_BASE_URL = 'http://localhost:3000/api';

export class BrutalFactsService {
  /**
   * Busca métricas dos colaboradores para Brutal Facts
   * @param cycle - Ciclo de avaliação (ex: "2025.1")
   * @returns Promise<BrutalFactsMetricsDto>
   */
  static async getBrutalFactsMetrics(cycle: string): Promise<BrutalFactsMetricsDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/manager/brutal-facts-metrics?cycle=${cycle}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar métricas: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar métricas de Brutal Facts:', error);
      throw error;
    }
  }

  /**
   * Busca análise da equipe para Brutal Facts
   * @param cycle - Ciclo de avaliação (ex: "2025.1")
   * @returns Promise<TeamAnalysisDto>
   */
  static async getTeamAnalysis(cycle: string): Promise<TeamAnalysisDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/manager/team-analysis?cycle=${cycle}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar análise da equipe: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar análise da equipe:', error);
      throw error;
    }
  }
}
