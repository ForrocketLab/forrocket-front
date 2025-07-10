import api from '../api';
import type {
  CreatePDIDto,
  UpdatePDIDto,
  PDIResponse,
  PDISummary,
  PDIActionResponse,
  PDIActionStatus
} from '../types/pdis';

/**
 * Service para comunicação com a API de PDIs
 */
class PDIService {
  private basePath = '/pdis';

  // ==========================================
  // OPERAÇÕES DE PDI
  // ==========================================

  /**
   * Cria um novo PDI
   */
  async createPDI(data: CreatePDIDto): Promise<PDIResponse> {
    const response = await api.post(this.basePath, data);
    return response.data;
  }

  /**
   * Busca todos os PDIs do usuário logado
   */
  async getUserPDIs(): Promise<PDISummary[]> {
    const response = await api.get(this.basePath);
    const pdis = response.data;
    
    // Transformar dados do backend para o formato PDISummary
    return pdis.map((pdi: any) => {
      const completedActions = pdi.actions?.filter((action: any) => action.status === 'COMPLETED').length || 0;
      const totalActions = pdi.actions?.length || 0;
      
      // Se o PDI está marcado como COMPLETED, o progresso é sempre 100%
      // Caso contrário, calcula baseado nas ações concluídas
      const progressPercentage = pdi.status === 'COMPLETED' 
        ? 100 
        : totalActions > 0 
          ? Math.round((completedActions / totalActions) * 100)
          : 0;

      return {
        id: pdi.id,
        title: pdi.title,
        description: pdi.description,
        startDate: pdi.startDate,
        endDate: pdi.endDate,
        status: pdi.status,
        actionsCount: totalActions,
        completedActions: completedActions,
        progressPercentage: progressPercentage,
        updatedAt: pdi.updatedAt
      };
    });
  }

  /**
   * Busca um PDI específico por ID
   */
  async getPDIById(id: string): Promise<PDIResponse> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Atualiza um PDI existente
   */
  async updatePDI(id: string, data: UpdatePDIDto): Promise<PDIResponse> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Remove um PDI
   */
  async deletePDI(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // ==========================================
  // MÉTODOS UTILITÁRIOS
  // ==========================================

  /**
   * Busca PDIs por status
   */
  async getPDIsByStatus(status: string): Promise<PDISummary[]> {
    const pdis = await this.getUserPDIs();
    return pdis.filter(pdi => pdi.status === status);
  }

  /**
   * Busca PDIs ativos
   */
  async getActivePDIs(): Promise<PDISummary[]> {
    return this.getPDIsByStatus('IN_PROGRESS');
  }

  /**
   * Calcula estatísticas dos PDIs do usuário
   */
  async getPDIStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  }> {
    const pdis = await this.getUserPDIs();
    
    const total = pdis.length;
    const active = pdis.filter(pdi => pdi.status === 'IN_PROGRESS').length;
    const completed = pdis.filter(pdi => pdi.status === 'COMPLETED').length;
    
    const totalProgress = pdis.reduce((sum, pdi) => sum + pdi.progressPercentage, 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {
      total,
      active,
      completed,
      averageProgress
    };
  }

  /**
   * Busca PDIs que estão próximos do prazo final
   */
  async getPDIsNearDeadline(days: number = 30): Promise<PDISummary[]> {
    const pdis = await this.getUserPDIs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return pdis.filter(pdi => {
      const endDate = new Date(pdi.endDate);
      return endDate <= cutoffDate && pdi.status !== 'COMPLETED' && pdi.status !== 'ARCHIVED';
    });
  }

  /**
   * Calcula o progresso médio de um período específico
   */
  async getProgressByPeriod(startDate: string, endDate: string): Promise<number> {
    const pdis = await this.getUserPDIs();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const pdisInPeriod = pdis.filter(pdi => {
      const pdiStart = new Date(pdi.startDate);
      const pdiEnd = new Date(pdi.endDate);
      return (pdiStart >= start && pdiStart <= end) || 
             (pdiEnd >= start && pdiEnd <= end) ||
             (pdiStart <= start && pdiEnd >= end);
    });

    if (pdisInPeriod.length === 0) return 0;

    const totalProgress = pdisInPeriod.reduce((sum, pdi) => sum + pdi.progressPercentage, 0);
    return Math.round(totalProgress / pdisInPeriod.length);
  }

  // ==========================================
  // MÉTODOS PARA GERENCIAR AÇÕES INDIVIDUAIS
  // ==========================================

  /**
   * Busca uma ação específica por ID
   */
  async getActionById(actionId: string): Promise<PDIActionResponse> {
    const response = await api.get(`${this.basePath}/actions/${actionId}`);
    return response.data;
  }

  /**
   * Atualiza uma ação específica
   */
  async updateAction(actionId: string, data: Partial<PDIActionResponse>): Promise<PDIActionResponse> {
    const response = await api.patch(`${this.basePath}/actions/${actionId}`, data);
    return response.data;
  }

  /**
   * Alterna o status de uma ação (TO_DO → IN_PROGRESS → COMPLETED → TO_DO)
   */
  async toggleActionStatus(actionId: string): Promise<PDIActionResponse> {
    const response = await api.put(`${this.basePath}/actions/${actionId}/toggle-status`);
    return response.data;
  }

  /**
   * Atualiza apenas o status de uma ação
   */
  async updateActionStatus(actionId: string, status: string): Promise<PDIActionResponse> {
    return this.updateAction(actionId, { status: status as PDIActionStatus });
  }
}

const pdiService = new PDIService();
export default pdiService; 