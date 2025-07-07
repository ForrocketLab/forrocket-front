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

// DTOs do backend para a rota /api/projects/overview
export interface MentorInfoDto {
  id: string;
  name: string;
  jobTitle: string;
}

export interface MenteeInfoDto {
  id: string;
  name: string;
  jobTitle: string;
}

export interface ManagedSubordinateDto {
  id: string;
  name: string;
  jobTitle: string;
}

export interface ProjectWithManagementDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles: string[];
  managedSubordinates: ManagedSubordinateDto[];
  isManagerInProject: boolean;
}

export interface UserOverviewDto {
  user: UserData;
  mentor: MentorInfoDto | null;
  mentees: MenteeInfoDto[];
  projects: ProjectWithManagementDto[];
  directReports: ManagedSubordinateDto[];
}

export interface UserDetailsData extends UserData {
  projects: Array<{
    id: string;
    name: string;
    roleInProject: 'colaborador' | 'gestor';
    managedCollaborators?: Array<{
      id: string;
      name: string;
      jobTitle: string;
    }>;
  }>;
  mentor: {
    id: string;
    name: string;
    jobTitle: string;
  } | null;
  mentees: Array<{
    id: string;
    name: string;
    jobTitle: string;
  }>;
  directReports: Array<{
    id: string;
    name: string;
    jobTitle: string;
  }>;
  lastLoginAt?: string;
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
   * Buscar todos os usuários
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
   * Buscar detalhes completos de um usuário específico usando a nova rota admin
   */
  static async getUserDetails(userId: string): Promise<UserDetailsData> {
    try {
      // Usar a nova rota admin específica
      const response = await api.get<UserOverviewDto>(`/projects/admin/user-overview/${userId}`);
      
      const overview = response.data;
      
      // Debug: verificar estrutura dos dados recebidos
      console.log('📊 Dados recebidos da API admin overview:', {
        hasUser: !!overview?.user,
        hasMentor: !!overview?.mentor,
        menteesCount: overview?.mentees?.length || 0,
        projectsCount: overview?.projects?.length || 0,
        rawData: overview
      });
      
      // Agora a API sempre retorna o campo user
      if (!overview.user) {
        throw new Error('API não retornou informações do usuário.');
      }
      
      const userData = overview.user;
      
      // Transformar os dados do DTO para o formato esperado
      const projects = (overview.projects || []).map(project => {
        // Determinar o papel principal no projeto baseado nas roles
        let roleInProject: 'colaborador' | 'gestor' = 'colaborador';
        if (project.userRoles && project.userRoles.includes('MANAGER')) {
          roleInProject = 'gestor';
        }
        
        return {
          id: project.id,
          name: project.name,
          roleInProject,
          managedCollaborators: roleInProject === 'gestor' ? 
            (project.managedSubordinates || []).map(sub => ({
              id: sub.id,
              name: sub.name,
              jobTitle: sub.jobTitle
            })) : undefined
        };
      });

      const mentor = overview.mentor ? {
        id: overview.mentor.id,
        name: overview.mentor.name,
        jobTitle: overview.mentor.jobTitle
      } : null;

      const mentees = (overview.mentees || []).map(mentee => ({
        id: mentee.id,
        name: mentee.name,
        jobTitle: mentee.jobTitle
      }));

      // Buscar subordinados diretos baseado na estrutura legada
      const directReports: Array<{
        id: string;
        name: string;
        jobTitle: string;
      }> = [];

      // Buscar última atividade se necessário
      let lastLoginAt = userData.updatedAt;
      try {
        const evaluationDetailsResponse = await api.get(`/users/${userId}/evaluation-details`);
        const evaluationDetails = evaluationDetailsResponse.data;
        if (evaluationDetails?.lastLoginAt || evaluationDetails?.lastActivity) {
          lastLoginAt = evaluationDetails.lastLoginAt || evaluationDetails.lastActivity;
        }
      } catch (error) {
        console.log('Informações de última atividade não disponíveis para este usuário');
      }

      const userDetails: UserDetailsData = {
        ...userData,
        projects,
        mentor,
        mentees,
        directReports,
        lastLoginAt
      };

      console.log('✅ Detalhes do usuário carregados via admin overview:', {
        userId,
        userName: userData.name,
        projectsCount: projects.length,
        hasMentor: !!mentor,
        mentorName: mentor?.name || 'Nenhum',
        menteesCount: mentees.length,
        menteesNames: mentees.map(m => m.name),
        projectRoles: projects.map(p => `${p.name}: ${p.roleInProject}`)
      });
      
      return userDetails;
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário via admin overview:', error);
      
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        console.log('📊 Detalhes do erro da API:', {
          status,
          message,
          responseData: error.response.data,
          url: error.config?.url
        });
        
        if (status === 404) {
          throw new Error(`Usuário ${userId} não encontrado.`);
        } else if (status === 403) {
          throw new Error('Acesso negado para visualizar detalhes deste usuário.');
        } else {
          throw new Error(message || 'Falha ao buscar detalhes do usuário.');
        }
      }
      
      // Se o erro não é do Axios, pode ser um erro de processamento dos dados
      if (error instanceof TypeError && error.message.includes('map')) {
        throw new Error('Dados recebidos da API estão em formato incorreto. Verifique a implementação do backend.');
      }
      
      throw new Error('Erro de conexão. Verifique sua conexão e tente novamente.');
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