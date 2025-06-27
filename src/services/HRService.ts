import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';
import type { TalentMatrixData, TalentMatrixPosition, TalentMatrixStats } from '../types/talentMatrix';

// Tipos específicos para RH Dashboard
interface HRDashboardMetrics {
  totalCollaborators: number;
  evaluationsCompleted: number;
  evaluationsPending: number;
  cycleProgress: number;
}

interface BusinessUnitProgress {
  name: string;
  totalCollaborators: number;
  completedEvaluations: number;
  progressPercentage: number;
}

interface CollaboratorStatus {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  seniority: string;
  businessUnit: string;
  initials: string;
  status: 'PENDING' | 'FINALIZADO';
  selfAssessmentStatus: string;
  managerAssessmentStatus: string;
  peerAssessmentsCompleted: number;
}

interface HRDashboardResponse {
  activeCycle: {
    id: string;
    name: string;
    phase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
    startDate: string | null;
    endDate: string | null;
  };
  metrics: HRDashboardMetrics;
  businessUnits: BusinessUnitProgress[];
  collaborators: CollaboratorStatus[];
}

interface CyclePhaseResponse {
  cycleId: string;
  cycleName: string;
  currentPhase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
  phaseDescription: string;
  allowedEvaluations: {
    selfAssessment: boolean;
    assessment360: boolean;
    mentoringAssessment: boolean;
    referenceFeedback: boolean;
    managerAssessment: boolean;
  };
  nextPhase: string | null;
}

export interface CollaboratorDetails {
  id: string;
  name: string;
  email: string;
  roles: string[];
  jobTitle: string;
  seniority: string;
  careerTrack: string;
  businessUnit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  managerName: string | null;
  mentorName: string | null;
  directReportsCount: number;
}

export interface CollaboratorWithEvaluationProgress extends CollaboratorDetails {
  evaluationProgress: {
    selfAssessment: {
      status: string;
      submittedAt: string | null;
    };
    assessments360Received: number;
    managerAssessment: {
      status: string;
      submittedAt: string | null;
    };
    mentoringAssessmentsReceived: number;
    referenceFeedbacksReceived: number;
    committeeAssessment: {
      status: string;
      submittedAt: string | null;
    };
  };
}

export interface EvaluationStepProgress {
  name: string;
  completed: boolean;
  count?: number;
}

export interface CollaboratorFilters {
  search?: string;
  businessUnit?: string;
  seniority?: string;
  careerTrack?: string;
  isActive?: boolean;
  roles?: string[];
}

class HRService {
  private static instance: HRService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 segundos

  public static getInstance(): HRService {
    if (!HRService.instance) {
      HRService.instance = new HRService();
    }
    return HRService.instance;
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

  // Busca o ciclo ativo e sua fase atual
  static async getActiveCyclePhase(): Promise<CyclePhaseResponse> {
    try {
      const response = await api.get<CyclePhaseResponse>('/evaluation-cycles/active/phase');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar fase do ciclo ativo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar fase do ciclo ativo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // Busca informações detalhadas do ciclo ativo com deadlines
  static async getActiveCycleWithDeadlines(): Promise<any> {
    try {
      // Primeiro buscar o ciclo ativo
      const activeCycleResponse = await api.get('/evaluation-cycles/active');
      const activeCycle = activeCycleResponse.data;
      
      // Depois buscar as informações de deadlines
      const deadlinesResponse = await api.get(`/evaluation-cycles/${activeCycle.id}/deadlines`);
      
      return {
        ...activeCycle,
        deadlinesInfo: deadlinesResponse.data
      };
    } catch (error) {
      console.error('Erro ao buscar informações detalhadas do ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar informações do ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // Busca todos os colaboradores para equalização (contém dados úteis para RH)
  static async getCollaboratorsForEqualization(): Promise<any> {
    try {
      const response = await api.get('/evaluations/committee/collaborators');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar colaboradores.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // Simula dados do dashboard RH baseado nas APIs disponíveis
  static async getHRDashboard(): Promise<HRDashboardResponse> {
    try {
      const [cyclePhase, collaboratorsData] = await Promise.all([
        this.getActiveCyclePhase(),
        this.getCollaboratorsForEqualization()
      ]);

      // Processar dados dos colaboradores
      const collaborators: CollaboratorStatus[] = collaboratorsData.collaborators?.map((collab: any) => ({
        id: collab.id,
        name: collab.name,
        email: collab.email,
        jobTitle: collab.jobTitle,
        seniority: collab.seniority,
        businessUnit: collab.businessUnit || 'Não definido',
        initials: this.getInitials(collab.name),
        status: collab.hasCommitteeAssessment ? 'FINALIZADO' : 'PENDING',
        selfAssessmentStatus: 'PENDENTE', // Simplificado por enquanto
        managerAssessmentStatus: 'PENDENTE',
        peerAssessmentsCompleted: 0
      })) || [];

      // Calcular métricas por unidade de negócio
      const businessUnitsMap = new Map<string, { total: number; completed: number }>();
      
      collaborators.forEach(collab => {
        const unit = collab.businessUnit;
        if (!businessUnitsMap.has(unit)) {
          businessUnitsMap.set(unit, { total: 0, completed: 0 });
        }
        const unitData = businessUnitsMap.get(unit)!;
        unitData.total++;
        if (collab.status === 'FINALIZADO') {
          unitData.completed++;
        }
      });

      const businessUnits: BusinessUnitProgress[] = Array.from(businessUnitsMap.entries()).map(([name, data]) => ({
        name,
        totalCollaborators: data.total,
        completedEvaluations: data.completed,
        progressPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

      // Calcular métricas gerais
      const totalCollaborators = collaborators.length;
      const evaluationsCompleted = collaborators.filter(c => c.status === 'FINALIZADO').length;
      const evaluationsPending = totalCollaborators - evaluationsCompleted;
      const cycleProgress = totalCollaborators > 0 ? Math.round((evaluationsCompleted / totalCollaborators) * 100) : 0;

      // Calcular dias restantes para fechamento do ciclo
      const getDaysRemaining = (endDate: string | null): number => {
        if (!endDate) return 30; // Default
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(diffDays, 0);
      };

      return {
        activeCycle: {
          id: cyclePhase.cycleId,
          name: cyclePhase.cycleName,
          phase: cyclePhase.currentPhase,
          startDate: null, // Dados não disponíveis na API atual
          endDate: null
        },
        metrics: {
          totalCollaborators,
          evaluationsCompleted,
          evaluationsPending,
          cycleProgress
        },
        businessUnits,
        collaborators
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard RH:', error);
      throw error;
    }
  }

  // Função auxiliar para gerar iniciais
  private static getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Busca todos os colaboradores (apenas RH/Admin)
   */
  static async getAllCollaborators(): Promise<CollaboratorDetails[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar colaboradores.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca todos os colaboradores com progresso de avaliações (apenas RH/Admin)
   */
  async getAllCollaboratorsWithEvaluationProgress(forceRefresh = false): Promise<CollaboratorWithEvaluationProgress[]> {
    const cacheKey = 'collaborators-with-progress';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.get('/users/with-evaluation-progress');
      const result = this.convertToCollaboratorWithProgress(response.data);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar colaboradores com progresso:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar colaboradores com progresso.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  private convertToCollaboratorWithProgress(data: any[]): CollaboratorWithEvaluationProgress[] {
    return data.map((collab: any) => ({
      id: collab.id,
      name: collab.name,
      email: collab.email,
      role: collab.role,
      roles: collab.roles || [],
      businessUnit: collab.businessUnit || 'N/A',
      seniority: collab.seniority || 'N/A',
      position: collab.position || 'N/A',
      jobTitle: collab.jobTitle || collab.position || 'N/A',
      careerTrack: collab.careerTrack || 'N/A',
      managerId: collab.managerId,
      managerName: collab.managerName || null,
      mentorName: collab.mentorName || null,
      isActive: collab.isActive,
      directReportsCount: collab.directReportsCount || 0,
      createdAt: collab.createdAt || new Date().toISOString(),
      updatedAt: collab.updatedAt || new Date().toISOString(),
      evaluationProgress: {
        selfAssessment: {
          status: collab.evaluationProgress?.selfAssessment?.status || 'PENDING',
          submittedAt: collab.evaluationProgress?.selfAssessment?.submittedAt || null
        },
        assessments360Received: collab.evaluationProgress?.assessments360Received || 0,
        managerAssessment: {
          status: collab.evaluationProgress?.managerAssessment?.status || 'PENDING',
          submittedAt: collab.evaluationProgress?.managerAssessment?.submittedAt || null
        },
        mentoringAssessmentsReceived: collab.evaluationProgress?.mentoringAssessmentsReceived || 0,
        referenceFeedbacksReceived: collab.evaluationProgress?.referenceFeedbacksReceived || 0,
        committeeAssessment: {
          status: collab.evaluationProgress?.committeeAssessment?.status || 'PENDING',
          submittedAt: collab.evaluationProgress?.committeeAssessment?.submittedAt || null
        }
      }
    }));
  }

  /**
   * Converte dados reais de avaliação em etapas de progresso
   */
  static getEvaluationStepsFromProgress(progress: CollaboratorWithEvaluationProgress['evaluationProgress']): EvaluationStepProgress[] {
    return [
      {
        name: 'Autoavaliação',
        completed: progress.selfAssessment.status === 'SUBMITTED'
      },
      {
        name: 'Avaliação 360',
        completed: progress.assessments360Received > 0,
        count: progress.assessments360Received
      },
      {
        name: 'Avaliação Gestor',
        completed: progress.managerAssessment.status === 'SUBMITTED'
      },
      {
        name: 'Mentoring',
        completed: progress.mentoringAssessmentsReceived > 0,
        count: progress.mentoringAssessmentsReceived
      },
      {
        name: 'Referências',
        completed: progress.referenceFeedbacksReceived > 0,
        count: progress.referenceFeedbacksReceived
      },
      {
        name: 'Avaliação de Comitê',
        completed: progress.committeeAssessment.status === 'SUBMITTED'
      }
    ];
  }

  /**
   * Calcula o progresso percentual das avaliações
   */
  static calculateEvaluationProgress(steps: EvaluationStepProgress[]): {
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
  } {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      completedSteps,
      totalSteps,
      progressPercentage
    };
  }

  /**
   * Filtra colaboradores localmente
   */
  static filterCollaborators(
    collaborators: CollaboratorDetails[],
    filters: CollaboratorFilters
  ): CollaboratorDetails[] {
    return collaborators.filter(collaborator => {
      // Filtro por busca (nome ou email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          collaborator.name.toLowerCase().includes(searchLower) ||
          collaborator.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por unidade de negócio
      if (filters.businessUnit && collaborator.businessUnit !== filters.businessUnit) {
        return false;
      }

      // Filtro por senioridade
      if (filters.seniority && collaborator.seniority !== filters.seniority) {
        return false;
      }

      // Filtro por trilha de carreira
      if (filters.careerTrack && collaborator.careerTrack !== filters.careerTrack) {
        return false;
      }

      // Filtro por status ativo
      if (filters.isActive !== undefined && collaborator.isActive !== filters.isActive) {
        return false;
      }

      // Filtro por roles
      if (filters.roles && filters.roles.length > 0) {
        const hasAnyRole = filters.roles.some(role => collaborator.roles.includes(role));
        if (!hasAnyRole) return false;
      }

      return true;
    });
  }

  /**
   * Filtra colaboradores com progresso de avaliações localmente
   */
  static filterCollaboratorsWithProgress(
    collaborators: CollaboratorWithEvaluationProgress[],
    filters: CollaboratorFilters
  ): CollaboratorWithEvaluationProgress[] {
    return collaborators.filter(collaborator => {
      // Filtro por busca (nome ou email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          collaborator.name.toLowerCase().includes(searchLower) ||
          collaborator.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por unidade de negócio
      if (filters.businessUnit && collaborator.businessUnit !== filters.businessUnit) {
        return false;
      }

      // Filtro por senioridade
      if (filters.seniority && collaborator.seniority !== filters.seniority) {
        return false;
      }

      // Filtro por trilha de carreira
      if (filters.careerTrack && collaborator.careerTrack !== filters.careerTrack) {
        return false;
      }

      // Filtro por status ativo
      if (filters.isActive !== undefined && collaborator.isActive !== filters.isActive) {
        return false;
      }

      // Filtro por roles
      if (filters.roles && filters.roles.length > 0) {
        const hasAnyRole = filters.roles.some(role => collaborator.roles.includes(role));
        if (!hasAnyRole) return false;
      }

      return true;
    });
  }

  /**
   * Busca dados reais do dashboard RH baseado em dados de avaliação reais
   */
  static async getHRDashboardWithRealData(): Promise<HRDashboardResponse> {
    try {
      const [cyclePhase, collaboratorsWithProgress] = await Promise.all([
        this.getActiveCyclePhase(),
        this.getAllCollaboratorsWithEvaluationProgress()
      ]);

      // Processar colaboradores com dados reais de progresso
      const collaborators: CollaboratorStatus[] = collaboratorsWithProgress.map((collab) => {
        // Avaliação finalizada = tem avaliação de comitê submetida
        const isFinalized = collab.evaluationProgress.committeeAssessment.status === 'SUBMITTED';
        
        return {
          id: collab.id,
          name: collab.name,
          email: collab.email,
          jobTitle: collab.jobTitle,
          seniority: collab.seniority,
          businessUnit: collab.businessUnit,
          initials: this.getInitials(collab.name),
          status: isFinalized ? 'FINALIZADO' : 'PENDING',
          selfAssessmentStatus: collab.evaluationProgress.selfAssessment.status,
          managerAssessmentStatus: collab.evaluationProgress.managerAssessment.status,
          peerAssessmentsCompleted: collab.evaluationProgress.assessments360Received
        };
      });

      // Calcular métricas por unidade de negócio com dados reais
      const businessUnitsMap = new Map<string, { total: number; completed: number }>();
      
      collaborators.forEach(collab => {
        const unit = collab.businessUnit;
        if (!businessUnitsMap.has(unit)) {
          businessUnitsMap.set(unit, { total: 0, completed: 0 });
        }
        const unitData = businessUnitsMap.get(unit)!;
        unitData.total++;
        if (collab.status === 'FINALIZADO') {
          unitData.completed++;
        }
      });

      const businessUnits: BusinessUnitProgress[] = Array.from(businessUnitsMap.entries()).map(([name, data]) => ({
        name,
        totalCollaborators: data.total,
        completedEvaluations: data.completed,
        progressPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

      // Calcular métricas gerais com dados reais
      const totalCollaborators = collaborators.length;
      const evaluationsCompleted = collaborators.filter(c => c.status === 'FINALIZADO').length;
      const evaluationsPending = totalCollaborators - evaluationsCompleted;
      const cycleProgress = totalCollaborators > 0 ? Math.round((evaluationsCompleted / totalCollaborators) * 100) : 0;

      return {
        activeCycle: {
          id: cyclePhase.cycleId,
          name: cyclePhase.cycleName,
          phase: cyclePhase.currentPhase,
          startDate: null, // Dados não disponíveis na API atual
          endDate: null
        },
        metrics: {
          totalCollaborators,
          evaluationsCompleted,
          evaluationsPending,
          cycleProgress
        },
        businessUnits,
        collaborators: collaborators.slice(0, 5) // Limitar a 5 para o dashboard
      };
    } catch (error) {
      console.error('Erro ao buscar dados reais do dashboard RH:', error);
      throw error;
    }
  }

  /**
   * Método estático para compatibilidade com código existente
   */
  static async getAllCollaboratorsWithEvaluationProgress(): Promise<CollaboratorWithEvaluationProgress[]> {
    return HRService.getInstance().getAllCollaboratorsWithEvaluationProgress();
  }

  /**
   * Força refresh dos dados
   */
  static async refreshCollaboratorsData(): Promise<CollaboratorWithEvaluationProgress[]> {
    return HRService.getInstance().getAllCollaboratorsWithEvaluationProgress(true);
  }

  /**
   * Limpa o cache
   */
  static clearCache(): void {
    HRService.getInstance().clearCache();
  }

    /**
   * Buscar dados detalhados de avaliação de um colaborador (para RH)
   * Utiliza API específica do RH sem restrição de fase
   */
  static async getCollaboratorEvaluationDetails(collaboratorId: string) {
    try {
      const response = await api.get(`/users/${collaboratorId}/evaluation-details`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados detalhados do colaborador:', error);
      throw error;
    }
  }

  /**
   * Busca dados da matriz 9-box de talento
   */
  static async getTalentMatrix(cycle?: string): Promise<TalentMatrixData> {
    const url = cycle ? `/users/talent-matrix?cycle=${cycle}` : '/users/talent-matrix';
    const response = await api.get(url);
    return response.data;
  }


}

export default HRService;
export type { HRDashboardResponse, CollaboratorStatus, BusinessUnitProgress, HRDashboardMetrics }; 