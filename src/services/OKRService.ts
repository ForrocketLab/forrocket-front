import api from '../api';
import type {
  CreateOKRDto,
  UpdateOKRDto,
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateKeyResultDto,
  UpdateKeyResultDto,
  OKRResponse,
  OKRSummary,
  ObjectiveResponse,
  KeyResultResponse
} from '../types/okrs';

/**
 * Service para comunicação com a API de OKRs
 */
class OKRService {
  private basePath = '/okrs';

  // ==========================================
  // OPERAÇÕES DE OKR
  // ==========================================

  /**
   * Cria um novo OKR
   */
  async createOKR(data: CreateOKRDto): Promise<OKRResponse> {
    const response = await api.post(this.basePath, data);
    return response.data;
  }

  /**
   * Busca todos os OKRs do usuário logado
   */
  async getUserOKRs(): Promise<OKRSummary[]> {
    const response = await api.get(this.basePath);
    return response.data;
  }

  /**
   * Busca um OKR específico por ID
   */
  async getOKRById(id: string): Promise<OKRResponse> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Atualiza um OKR existente
   */
  async updateOKR(id: string, data: UpdateOKRDto): Promise<OKRResponse> {
    const response = await api.put(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Remove um OKR
   */
  async deleteOKR(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // ==========================================
  // OPERAÇÕES DE OBJETIVOS
  // ==========================================

  /**
   * Cria um novo objetivo para um OKR
   */
  async createObjective(okrId: string, data: CreateObjectiveDto): Promise<ObjectiveResponse> {
    const response = await api.post(`${this.basePath}/${okrId}/objectives`, data);
    return response.data;
  }

  /**
   * Busca um objetivo específico por ID
   */
  async getObjectiveById(id: string): Promise<ObjectiveResponse> {
    const response = await api.get(`${this.basePath}/objectives/${id}`);
    return response.data;
  }

  /**
   * Atualiza um objetivo existente
   */
  async updateObjective(id: string, data: UpdateObjectiveDto): Promise<ObjectiveResponse> {
    const response = await api.put(`${this.basePath}/objectives/${id}`, data);
    return response.data;
  }

  /**
   * Remove um objetivo
   */
  async deleteObjective(id: string): Promise<void> {
    await api.delete(`${this.basePath}/objectives/${id}`);
  }

  // ==========================================
  // OPERAÇÕES DE KEY RESULTS
  // ==========================================

  /**
   * Cria um novo key result para um objetivo
   */
  async createKeyResult(objectiveId: string, data: CreateKeyResultDto): Promise<KeyResultResponse> {
    const response = await api.post(`${this.basePath}/objectives/${objectiveId}/key-results`, data);
    return response.data;
  }

  /**
   * Busca um key result específico por ID
   */
  async getKeyResultById(id: string): Promise<KeyResultResponse> {
    const response = await api.get(`${this.basePath}/key-results/${id}`);
    return response.data;
  }

  /**
   * Atualiza um key result existente
   */
  async updateKeyResult(id: string, data: UpdateKeyResultDto): Promise<KeyResultResponse> {
    const response = await api.put(`${this.basePath}/key-results/${id}`, data);
    return response.data;
  }

  /**
   * Remove um key result
   */
  async deleteKeyResult(id: string): Promise<void> {
    await api.delete(`${this.basePath}/key-results/${id}`);
  }

  // ==========================================
  // MÉTODOS UTILITÁRIOS
  // ==========================================

  /**
   * Verifica se um trimestre já possui OKR
   */
  async hasOKRForQuarter(quarter: string, year: number): Promise<boolean> {
    try {
      const okrs = await this.getUserOKRs();
      return okrs.some(okr => okr.quarter === quarter && okr.year === year);
    } catch {
      return false;
    }
  }

  /**
   * Busca OKRs por status
   */
  async getOKRsByStatus(status: string): Promise<OKRSummary[]> {
    const okrs = await this.getUserOKRs();
    return okrs.filter(okr => okr.status === status);
  }

  /**
   * Busca OKRs ativos
   */
  async getActiveOKRs(): Promise<OKRSummary[]> {
    return this.getOKRsByStatus('ACTIVE');
  }

  /**
   * Calcula estatísticas dos OKRs do usuário
   */
  async getOKRStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  }> {
    const okrs = await this.getUserOKRs();
    
    const total = okrs.length;
    const active = okrs.filter(okr => okr.status === 'ACTIVE').length;
    const completed = okrs.filter(okr => okr.status === 'COMPLETED').length;
    
    const totalProgress = okrs.reduce((sum, okr) => sum + okr.overallProgress, 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {
      total,
      active,
      completed,
      averageProgress
    };
  }
}

const okrService = new OKRService();
export default okrService; 