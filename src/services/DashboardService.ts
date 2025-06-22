import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import { type DetailedSelfAssessment, type CreateManagerSubordinateAssessment } from '../types/detailedEvaluations'; // Importa o novo tipo

class DashboardService {
  // ... (métodos existentes getManagerDashboard e getActiveCycle)

  static async getManagerDashboard(cycle: string): Promise<ManagerDashboardResponse> {
    try {
      // O 'params' do Axios adiciona "?cycle=2025.1" à URL
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

  // Busca as informações do ciclo de avaliação atualmente ativo.
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

  // NOVO MÉTODO: Enviar avaliação do gestor para o subordinado
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
}

export default DashboardService;