import { AxiosError } from 'axios';
import api from '../api';

export interface AuditLogMetrics {
  totalLogs: number;
  dailyLogs: number;
  activeUsers: number;
  totalApiCalls: number;
}

export interface HourlyApiCalls {
  hour: string;
  count: number;
}

export interface TopApiEndpoint {
  endpoint: string;
  count: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  eventType: string;
  details: any;
  originIp?: string;
}

class AuditService {
  /**
   * Obtém as métricas totais e diárias do sistema.
   */
  static async getAuditLogMetrics(): Promise<AuditLogMetrics> {
    try {
      const [totalLogsRes, dailyLogsRes, activeUsersRes, totalApiCallsRes] = await Promise.all([
        api.get<{ totalLogs: number }>('/monitoring/total-logs'),
        api.get<{ dailyLogs: number }>('/monitoring/daily-logs'),
        api.get<{ activeUsers: number }>('/monitoring/active-users'),
        api.get<{ totalApiCalls: number }>('/monitoring/total-api-calls'),
      ]);

      return {
        totalLogs: totalLogsRes.data.totalLogs,
        dailyLogs: dailyLogsRes.data.dailyLogs,
        activeUsers: activeUsersRes.data.activeUsers,
        totalApiCalls: totalApiCallsRes.data.totalApiCalls,
      };
    } catch (error) {
      console.error('Erro ao buscar métricas de audit log:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Erro ao carregar métricas.');
      }
      throw new Error('Falha de rede ao carregar métricas do sistema de auditoria.');
    }
  }

  /**
   * Obtém as métricas totais e diárias do sistema.
   */
  static async getHourlyApiCalls(timeframeHours: number = 24): Promise<HourlyApiCalls[]> {
    try {
      const response = await api.get<HourlyApiCalls[]>('/monitoring/hourly-api-calls', {
        params: { timeframeHours },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar chamadas de API por hora:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Erro ao buscar chamadas por hora.');
      }
      throw new Error('Falha de rede ao buscar chamadas por hora.');
    }
  }

  /**
   * Obtém os endpoints de API mais chamados.
   */
  static async getTopApiEndpoints(limit: number = 5): Promise<TopApiEndpoint[]> {
    try {
      const response = await api.get<{ topEndpoints: TopApiEndpoint[] }>('/monitoring/top-api-endpoints', {
        params: { limit },
      });
      return response.data.topEndpoints;
    } catch (error) {
      console.error('Erro ao buscar top endpoints de API:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Erro ao buscar endpoints mais usados.');
      }
      throw new Error('Falha de rede ao buscar top endpoints.');
    }
  }

 /**
   * Obtém entradas de log de auditoria recentes do backend.
   */
  static async getRecentLogEntries(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
    excludeAdminLogs?: boolean;
  }): Promise<AuditLogEntry[]> {
    try {
      const response = await api.get<AuditLogEntry[]>('/monitoring/recent-logs', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar entradas de log recentes:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Erro ao buscar logs recentes.');
      }
      throw new Error('Falha de rede ao buscar logs recentes.');
    }
  }
}

export default AuditService;