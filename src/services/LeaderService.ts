import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';

export interface ProjectListItem {
  projectId: string;
  projectName: string;
}

export interface ProjectDetails {
  projectName: string;
  scores: { cycle: string; score: number; reason: string; }[];
  percentage: number;
  EndDate: string;
  CollaboratorsNumber: number;
}

class LeaderService {
  /**
   * PASSO 1: Busca a lista de projetos associados ao usuário logado (o líder).
   * Baseado na função getCollaboratorProjects que você indicou.
   * @param userId O ID do usuário logado (líder).
   */
  static async getProjectList(userId: string): Promise<ProjectListItem[]> {
    try {
      const response = await api.get<ProjectListItem[]>(`/users/${userId}/projects`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar projetos para o usuário ${userId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar a lista de projetos.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * PASSO 2: Busca os detalhes completos de um ÚNICO projeto selecionado.
   * Utiliza o endpoint de 'evaluations' que é rico em dados.
   */
  static async getProjectDetails(projectId: string): Promise<ProjectDetails> {
    try {
      const response = await api.get<ProjectDetails>(`/evaluations/collaborator/projects/${projectId}/details`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do projeto ${projectId}:`, error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error(`Projeto com ID '${projectId}' não encontrado.`);
      }
      throw new Error('Falha ao carregar os detalhes do projeto.');
    }
  }
  // Em src/services/LeaderService.ts

  /**
   * Busca os dados do gráfico de burndown para um projeto específico.
   */
  static async getBurndownData(projectId: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`/leader/projects/${projectId}/burndown`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dados de burndown para o projeto ${projectId}:`, error);
      return []; // Retorna array vazio em caso de erro para o gráfico não quebrar
    }
  }

}

export default LeaderService;