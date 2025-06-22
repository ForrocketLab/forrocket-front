import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';

class ManagerService {
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
}

export default ManagerService;
