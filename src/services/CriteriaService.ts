import { AxiosError } from 'axios';
import api from '../api';

// Tipos para critérios
export interface Criterion {
  id: string;
  name: string;
  description: string;
  pillar: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCriterionDto {
  name: string;
  description: string;
  pillar: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight?: number;
  isRequired?: boolean;
}

export interface UpdateCriterionDto {
  name?: string;
  description?: string;
  pillar?: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight?: number;
  isRequired?: boolean;
}

class CriteriaServiceClass {
  private static instance: CriteriaServiceClass;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minuto

  public static getInstance(): CriteriaServiceClass {
    if (!CriteriaServiceClass.instance) {
      CriteriaServiceClass.instance = new CriteriaServiceClass();
    }
    return CriteriaServiceClass.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)?.data || null;
    }
    return null;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Lista todos os critérios
   */
  async getAllCriteria(forceRefresh = false): Promise<Criterion[]> {
    const cacheKey = 'all-criteria';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/criteria');
      const result = response.data as Criterion[];
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar critérios:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar critérios.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca um critério por ID
   */
  async getCriterionById(id: string): Promise<Criterion> {
    try {
      const response = await api.get(`/criteria/${id}`);
      return response.data as Criterion;
    } catch (error) {
      console.error('Erro ao buscar critério:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar critério.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Cria um novo critério
   */
  async createCriterion(data: CreateCriterionDto): Promise<Criterion> {
    try {
      const response = await api.post('/criteria', data);
      this.clearCache(); // Limpa cache após criação
      return response.data as Criterion;
    } catch (error) {
      console.error('Erro ao criar critério:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar critério.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Atualiza um critério existente
   */
  async updateCriterion(id: string, data: UpdateCriterionDto): Promise<Criterion> {
    try {
      const response = await api.patch(`/criteria/${id}`, data);
      this.clearCache(); // Limpa cache após atualização
      return response.data as Criterion;
    } catch (error) {
      console.error('Erro ao atualizar critério:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar critério.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Remove um critério
   */
  async deleteCriterion(id: string): Promise<void> {
    try {
      await api.delete(`/criteria/${id}`);
      this.clearCache(); // Limpa cache após remoção
    } catch (error) {
      console.error('Erro ao remover critério:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao remover critério.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Alterna a obrigatoriedade de um critério
   */
  async toggleRequired(id: string): Promise<Criterion> {
    try {
      const response = await api.patch(`/criteria/${id}/toggle-required`);
      this.clearCache(); // Limpa cache após alteração
      return response.data as Criterion;
    } catch (error) {
      console.error('Erro ao alterar obrigatoriedade:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao alterar obrigatoriedade.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Métodos estáticos para compatibilidade
   */
  static async getAllCriteria(): Promise<Criterion[]> {
    return CriteriaServiceClass.getInstance().getAllCriteria();
  }

  static async refreshCriteria(): Promise<Criterion[]> {
    return CriteriaServiceClass.getInstance().getAllCriteria(true);
  }

  static clearCache(): void {
    CriteriaServiceClass.getInstance().clearCache();
  }

  static async toggleRequired(id: string): Promise<Criterion> {
    return CriteriaServiceClass.getInstance().toggleRequired(id);
  }

  static async updateCriterion(id: string, data: UpdateCriterionDto): Promise<Criterion> {
    return CriteriaServiceClass.getInstance().updateCriterion(id, data);
  }

  static async deleteCriterion(id: string): Promise<void> {
    return CriteriaServiceClass.getInstance().deleteCriterion(id);
  }

  static async createCriterion(data: CreateCriterionDto): Promise<Criterion> {
    return CriteriaServiceClass.getInstance().createCriterion(data);
  }

  /**
   * Utilitários
   */
  static getPillarDisplayName(pillar: string): string {
    const pillarNames = {
      'BEHAVIOR': 'Comportamento',
      'EXECUTION': 'Execução', 
      'MANAGEMENT': 'Gestão'
    };
    return pillarNames[pillar as keyof typeof pillarNames] || pillar;
  }

  static getPillarColor(pillar: string): string {
    const pillarColors = {
      'BEHAVIOR': 'bg-blue-100 text-blue-800',
      'EXECUTION': 'bg-green-100 text-green-800',
      'MANAGEMENT': 'bg-purple-100 text-purple-800'
    };
    return pillarColors[pillar as keyof typeof pillarColors] || 'bg-gray-100 text-gray-800';
  }
}

// Exportar a classe com métodos estáticos
export default CriteriaServiceClass; 