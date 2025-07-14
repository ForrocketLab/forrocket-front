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
  businessUnit?: string;
  isBase?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCriterionDto {
  name: string;
  description: string;
  pillar: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight?: number;
  isRequired?: boolean;
  businessUnit?: string;
}

export interface UpdateCriterionDto {
  name?: string;
  description?: string;
  pillar?: 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT';
  weight?: number;
  isRequired?: boolean;
  businessUnit?: string;
}

export const BusinessUnits = {
  DIGITAL_PRODUCTS: 'Digital Products',
  OPERATIONS: 'Operations',
} as const;

export type BusinessUnit = typeof BusinessUnits[keyof typeof BusinessUnits];

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
   * Lista critérios por unidade de negócio
   */
  async getCriteriaByBusinessUnit(businessUnit: string, forceRefresh = false): Promise<Criterion[]> {
    const cacheKey = `criteria-${businessUnit}`;
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get(`/criteria?businessUnit=${encodeURIComponent(businessUnit)}`);
      const result = response.data as Criterion[];
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar critérios por unidade de negócio:', error);
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
   * Lista critérios efetivos (base + específicos - removidos) para uma unidade de negócio
   */
  async getEffectiveCriteriaByBusinessUnit(businessUnit: string, forceRefresh = false): Promise<Criterion[]> {
    const cacheKey = `effective-criteria-${businessUnit}`;
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    try {
      const response = await api.get(`/public/criteria/effective?businessUnit=${encodeURIComponent(businessUnit)}`);
      const result = response.data as Criterion[];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar critérios efetivos:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar critérios.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Lista critérios efetivos para o usuário logado baseado em sua business unit
   */
  async getEffectiveCriteriaForUser(userBusinessUnit: string, forceRefresh = false): Promise<Criterion[]> {
    return this.getEffectiveCriteriaByBusinessUnit(userBusinessUnit, forceRefresh);
  }

  /**
   * Remove um critério base de uma unidade de negócio
   */
  async removeCriterionFromUnit(criterionId: string, businessUnit: string): Promise<void> {
    try {
      await api.post('/criteria/remove-from-unit', { criterionId, businessUnit });
      this.clearCache();
    } catch (error) {
      console.error('Erro ao remover critério da unidade:', error);
      throw new Error('Erro ao remover critério da unidade');
    }
  }

  /**
   * Restaura um critério base em uma unidade de negócio
   */
  async restoreCriterionToUnit(criterionId: string, businessUnit: string): Promise<void> {
    try {
      await api.post('/criteria/restore-to-unit', { criterionId, businessUnit });
      this.clearCache();
    } catch (error) {
      console.error('Erro ao restaurar critério na unidade:', error);
      throw new Error('Erro ao restaurar critério na unidade');
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

  static async getCriteriaByBusinessUnit(businessUnit: string): Promise<Criterion[]> {
    return CriteriaServiceClass.getInstance().getCriteriaByBusinessUnit(businessUnit);
  }

  static async getEffectiveCriteriaByBusinessUnit(businessUnit: string): Promise<Criterion[]> {
    return CriteriaServiceClass.getInstance().getEffectiveCriteriaByBusinessUnit(businessUnit);
  }

  static async getEffectiveCriteriaForUser(userBusinessUnit: string): Promise<Criterion[]> {
    return CriteriaServiceClass.getInstance().getEffectiveCriteriaForUser(userBusinessUnit);
  }

  static async removeCriterionFromUnit(criterionId: string, businessUnit: string): Promise<void> {
    return CriteriaServiceClass.getInstance().removeCriterionFromUnit(criterionId, businessUnit);
  }

  static async restoreCriterionToUnit(criterionId: string, businessUnit: string): Promise<void> {
    return CriteriaServiceClass.getInstance().restoreCriterionToUnit(criterionId, businessUnit);
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

  static getBusinessUnitDisplayName(businessUnit: string): string {
    switch (businessUnit) {
      case BusinessUnits.DIGITAL_PRODUCTS: return 'Digital Products';
      case BusinessUnits.OPERATIONS: return 'Operations';
      default: return 'Todas as Unidades';
    }
  }

  static getBusinessUnitColor(businessUnit: string): string {
    switch (businessUnit) {
      case BusinessUnits.DIGITAL_PRODUCTS: return 'bg-indigo-100 text-indigo-800';
      case BusinessUnits.OPERATIONS: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

// Exportar a classe com métodos estáticos
export default CriteriaServiceClass; 