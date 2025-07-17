import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import type { BrutalFactsMetricsDto, TeamAnalysisDto } from '../types/brutalFacts';

export class BrutalFactsService {
  /**
   * Busca métricas dos colaboradores para Brutal Facts
   * @param cycle - Ciclo de avaliação (ex: "2025.1")
   * @returns Promise<BrutalFactsMetricsDto>
   */
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

  /**
   * Busca análise da equipe para Brutal Facts
   * @param cycle - Ciclo de avaliação (ex: "2025.1")
   * @returns Promise<TeamAnalysisDto>
   */
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
}
