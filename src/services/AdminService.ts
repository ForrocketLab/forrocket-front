import { AxiosError } from 'axios';
import api from '../api';

// Tipos para Criação de Usuário
export interface CreateUserData {
  userType: 'admin' | 'rh' | 'comite' | 'project_member';
  name: string;
  email: string;
  password: string;
  jobTitle: string;
  seniority: string;
  careerTrack: string;
  businessUnit: string;
  projectAssignments?: Array<{
    projectId: string;
    roleInProject: 'colaborador' | 'gestor';
  }>;
  mentorId?: string;
}

// Tipos para Projetos e Hierarquia
export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithManagerData extends ProjectData {
  managerId?: string;
  managerName?: string;
  hasManager: boolean;
  collaboratorsCount: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  roles: string[];
}

export interface HierarchyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestedManagerId?: string;
  suggestedManagerName?: string;
}

// Tipos para Ciclos
export interface CycleData {
  id: string;
  name: string;
  status: 'UPCOMING' | 'OPEN' | 'EQUALIZATION' | 'CLOSED';
  phase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
  startDate: string | null;
  endDate: string | null;
  assessmentDeadline: string | null;
  managerDeadline: string | null;
  equalizationDeadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCycleData {
  name: string;
  startDate?: string;
  endDate?: string;
  assessmentDeadline?: string;
  managerDeadline?: string;
  equalizationDeadline?: string;
}

export interface ActivateCycleData {
  startDate?: string;
  endDate?: string;
  assessmentDeadline?: string;
  managerDeadline?: string;
  equalizationDeadline?: string;
  autoSetEndDate?: boolean;
}

export interface UpdateCycleStatusData {
  status: 'UPCOMING' | 'OPEN' | 'EQUALIZATION' | 'CLOSED';
}

export interface UpdateCyclePhaseData {
  phase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
}

// Tipos para usuários
export interface UserData {
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
  directReportsCount: number;
}

export interface UserWithEvaluationProgress extends UserData {
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

export interface CycleDeadlineInfo {
  deadlines: Array<{
    name: string;
    deadline: string | null;
    status: 'OK' | 'URGENT' | 'OVERDUE';
    daysRemaining: number | null;
  }>;
  summary: {
    totalDeadlines: number;
    urgentCount: number;
    overdueCount: number;
  };
  inconsistencies: string[];
}

class AdminService {
  // ===== GERENCIAMENTO DE USUÁRIOS =====
  
  /**
   * Criar um novo usuário
   */
  static async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      const response = await api.post<UserData>('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar usuário.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Buscar todos os projetos disponíveis
   */
  static async getAllProjects(): Promise<ProjectData[]> {
    try {
      const response = await api.get<ProjectData[]>('/projects/all');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar projetos.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Buscar projetos com informações de gestores
   */
  static async getProjectsWithManagers(): Promise<ProjectWithManagerData[]> {
    try {
      const response = await api.get<ProjectWithManagerData[]>('/projects/with-managers');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos com gestores:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar projetos com gestores.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Buscar usuários que podem ser mentores (ativos e experientes)
   */
  static async getPotentialMentors(): Promise<UserSummary[]> {
    try {
      const response = await api.get<UserSummary[]>('/users/potential-mentors');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar potenciais mentores:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar potenciais mentores.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Validar hierarquia de um projeto (verificar se já tem gestor)
   */
  static async validateProjectHierarchy(projectId: string, roleInProject: string): Promise<HierarchyValidationResult> {
    try {
      const response = await api.post<HierarchyValidationResult>('/users/validate-project-hierarchy', {
        projectId,
        roleInProject
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar hierarquia do projeto:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao validar hierarquia do projeto.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Listar todos os usuários
   */
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const response = await api.get<UserData[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar usuários.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Listar todos os usuários com progresso de avaliações
   */
  static async getAllUsersWithEvaluationProgress(): Promise<UserWithEvaluationProgress[]> {
    try {
      const response = await api.get<UserWithEvaluationProgress[]>('/users/with-evaluation-progress');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários com progresso:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar usuários com progresso.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // ===== GERENCIAMENTO DE CICLOS =====
  
  /**
   * Buscar todos os ciclos
   */
  static async getAllCycles(): Promise<CycleData[]> {
    try {
      const response = await api.get<CycleData[]>('/evaluation-cycles');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar ciclos.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Buscar ciclo ativo
   */
  static async getActiveCycle(): Promise<CycleData> {
    try {
      const response = await api.get<CycleData>('/evaluation-cycles/active');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ciclo ativo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar ciclo ativo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Criar um novo ciclo
   */
  static async createCycle(cycleData: CreateCycleData): Promise<CycleData> {
    try {
      const response = await api.post<CycleData>('/evaluation-cycles', cycleData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao criar ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Ativar um ciclo
   */
  static async activateCycle(cycleId: string, activateData: ActivateCycleData): Promise<CycleData> {
    try {
      const response = await api.patch<CycleData>(`/evaluation-cycles/${cycleId}/activate`, activateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao ativar ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao ativar ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Atualizar status do ciclo
   */
  static async updateCycleStatus(cycleId: string, statusData: UpdateCycleStatusData): Promise<CycleData> {
    try {
      const response = await api.patch<CycleData>(`/evaluation-cycles/${cycleId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar status do ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Atualizar fase do ciclo
   */
  static async updateCyclePhase(cycleId: string, phaseData: UpdateCyclePhaseData): Promise<CycleData> {
    try {
      const response = await api.patch<CycleData>(`/evaluation-cycles/${cycleId}/phase`, phaseData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar fase do ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao atualizar fase do ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Buscar informações de deadlines de um ciclo
   */
  static async getCycleDeadlines(cycleId: string): Promise<CycleDeadlineInfo> {
    try {
      const response = await api.get<CycleDeadlineInfo>(`/evaluation-cycles/${cycleId}/deadlines`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar deadlines do ciclo:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar deadlines do ciclo.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // ===== HELPERS =====
  
  /**
   * Buscar informações detalhadas de um ciclo (incluindo deadlines)
   */
  static async getCycleDetails(cycleId: string): Promise<CycleData & { deadlinesInfo: CycleDeadlineInfo }> {
    try {
      const [cycle, deadlines] = await Promise.all([
        this.getAllCycles().then(cycles => cycles.find(c => c.id === cycleId)),
        this.getCycleDeadlines(cycleId)
      ]);

      if (!cycle) {
        throw new Error('Ciclo não encontrado');
      }

      return {
        ...cycle,
        deadlinesInfo: deadlines
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do ciclo:', error);
      throw error;
    }
  }

  /**
   * Validar se é possível alterar fase do ciclo
   */
  static validatePhaseTransition(currentPhase: string, newPhase: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'ASSESSMENTS': ['MANAGER_REVIEWS'],
      'MANAGER_REVIEWS': ['EQUALIZATION'],
      'EQUALIZATION': []
    };

    return validTransitions[currentPhase]?.includes(newPhase) || false;
  }

  /**
   * Obter próxima fase válida
   */
  static getNextPhase(currentPhase: string): string | null {
    const nextPhases: { [key: string]: string } = {
      'ASSESSMENTS': 'MANAGER_REVIEWS',
      'MANAGER_REVIEWS': 'EQUALIZATION'
    };

    return nextPhases[currentPhase] || null;
  }
}

export default AdminService; 