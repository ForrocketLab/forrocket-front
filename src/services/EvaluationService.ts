import { AxiosError } from 'axios';
import api from '../api';
import type {
    EvaluableUsersResponse,
    Create360AssessmentPayload,
    CreateMentoringAssessmentPayload,
} from '../types/evaluations';
import AuthService from './AuthService';

class EvaluationService {
    private getToken(): string {
        const token = AuthService.getToken();
        if (!token) {
            throw new Error('Nenhum token de autenticação encontrado.');
        }
        return token;
    }

    async getEvaluableUsers(): Promise<EvaluableUsersResponse> {
        try {
            const response = await api.get<EvaluableUsersResponse>('/projects/evaluable-users', {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar usuários avaliáveis:', error);
            if (error instanceof AxiosError && error.response?.status === 401) {
                AuthService.logout();
                throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
            }
            throw new Error('Falha ao buscar usuários avaliáveis.');
        }
    }

    async create360Assessment(payload: Create360AssessmentPayload): Promise<void> {
        try {
            await api.post('/evaluations/collaborator/360-assessment', payload, {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`,
                },
            });
        } catch (error) {
            console.error('Erro ao criar avaliação 360:', error);
            if (error instanceof AxiosError && error.response) {
                throw new Error(error.response.data.message || 'Falha ao criar avaliação 360.');
            }
            throw new Error('Ocorreu um erro de rede. Tente novamente.');
        }
    }

    async createMentoringAssessment(payload: CreateMentoringAssessmentPayload): Promise<void> {
        try {
            await api.post('/evaluations/collaborator/mentoring-assessment', payload, {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`,
                },
            });
        } catch (error) {
            console.error('Erro ao criar avaliação de mentoring:', error);
            if (error instanceof AxiosError && error.response) {
                throw new Error(error.response.data.message || 'Falha ao criar avaliação de mentoring.');
            }
            throw new Error('Ocorreu um erro de rede. Tente novamente.');
        }
    }
}

export default new EvaluationService(); 