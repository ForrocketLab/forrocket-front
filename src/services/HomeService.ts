import api from '../api';
import { AxiosError } from 'axios';
import AuthService from './AuthService';

export interface ManagedSubordinate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

export interface LedSubordinate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: string[];
  managedSubordinates: ManagedSubordinate[];
  ledSubordinates: LedSubordinate[];
  isManagerInProject: boolean;
  isLeaderInProject: boolean;
  projectLeader: MentorInfo | null;
  projectManager: MentorInfo | null;
}

export interface MentorInfo {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

export interface MenteeInfo {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

export interface UserOverview {
  projects: Project[];
  mentor: MentorInfo | null;
  mentees: MenteeInfo[];
  hasMentor: boolean;
  isMentor: boolean;
  isManager: boolean;
  isLeader: boolean;
}

export interface QuickStats {
  totalProjects: number;
  activeEvaluations: number;
  pendingTasks: number;
  achievements: number;
}

export interface HomeData {
  userOverview: UserOverview;
  quickStats: QuickStats;
}

class HomeService {
  /**
   * Busca dados completos para a página home
   */
  static async getHomeData(): Promise<HomeData> {
    try {
      // Buscar overview do usuário
      const overviewResponse = await api.get<UserOverview>('/projects/overview', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      const userOverview = overviewResponse.data;

      return {
        userOverview,
        quickStats: {
          totalProjects: userOverview.projects.length,
          activeEvaluations: 0,
          pendingTasks: 0,
          achievements: 0
        },
      };
    } catch (error) {
      console.error('Erro ao buscar dados da home:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao carregar dados da home.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }



  /**
   * Busca dados simulados para desenvolvimento
   */
  static async getMockHomeData(): Promise<HomeData> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockOverview: UserOverview = {
      projects: [
        { 
          id: '1', 
          name: 'RPE System', 
          description: 'Sistema de Performance e Engajamento',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: ['COLLABORATOR'],
          managedSubordinates: [],
          ledSubordinates: [],
          isManagerInProject: false,
          isLeaderInProject: false,
          projectLeader: null,
          projectManager: null
        },
        { 
          id: '2', 
          name: 'Digital Products', 
          description: 'Produtos digitais da empresa',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: ['LEADER'],
          managedSubordinates: [],
          ledSubordinates: [
            {
              id: 'user-1',
              name: 'Ana Silva',
              email: 'ana.silva@rocketcorp.com',
              jobTitle: 'Frontend Developer'
            }
          ],
          isManagerInProject: false,
          isLeaderInProject: true,
          projectLeader: null,
          projectManager: null
        },
        { 
          id: '3', 
          name: 'Operations', 
          description: 'Operações e processos',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: ['MANAGER'],
          managedSubordinates: [
            {
              id: 'user-2',
              name: 'Carlos Santos',
              email: 'carlos.santos@rocketcorp.com',
              jobTitle: 'Backend Developer'
            }
          ],
          ledSubordinates: [],
          isManagerInProject: true,
          isLeaderInProject: false,
          projectLeader: null,
          projectManager: null
        }
      ],
      mentor: {
        id: 'mentor-1',
        name: 'Maria Silva',
        email: 'maria.silva@rocketcorp.com',
        jobTitle: 'Senior Developer'
      },
      mentees: [
        {
          id: 'mentee-1',
          name: 'João Santos',
          email: 'joao.santos@rocketcorp.com',
          jobTitle: 'Junior Developer'
        }
      ],
      hasMentor: true,
      isMentor: true,
      isManager: true,
      isLeader: true
    };

    const quickStats: QuickStats = {
      totalProjects: mockOverview.projects.length,
      activeEvaluations: 3,
      pendingTasks: 2,
      achievements: 5
    };

    return {
      userOverview: mockOverview,
      quickStats,
    };
  }
}

export default HomeService; 