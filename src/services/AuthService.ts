import { AxiosError } from 'axios';
import api from '../api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: UserInfo;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  jobTitle: string;
  seniority: string;
  careerTrack: string;
  businessUnit: string;
  projectRoles: { projectId: string; projectName: string; roles: string[] }[];
  managerId?: string | null;
  managerName?: string | null;
  directReports?: string[] | null;
  directReportsNames?: string[] | null;
  mentorId?: string | null;
  mentorName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ForgotPasswordDto {
  email: string;
}

interface VerifyResetCodeDto {
  email: string;
  code: string;
}

interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  async login(credentials: LoginCredentials): Promise<UserInfo> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem(this.TOKEN_KEY, token);
      return user;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message;

        if (status === 401) {
          throw new Error(backendMessage || 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
        } else if (status === 404) {
          throw new Error(backendMessage || 'Usuário não encontrado. Verifique o email informado.');
        } else {
          throw new Error(backendMessage || 'Falha ao tentar fazer login.');
        }
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    try {
      await api.post('/auth/forgot-password', data);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Erro ao enviar solicitação de redefinição de senha.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto): Promise<boolean> {
    try {
      const response = await api.post('/auth/verify-reset-code', verifyResetCodeDto);
      return response.status === 200;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Código de redefinição inválido ou expirado.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      await api.post('/auth/reset-password', resetPasswordDto);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Não foi possível redefinir a senha. Verifique o código e tente novamente.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  async getProfile(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Nenhum token de autenticação encontrado.');
    }

    try {
      const response = await api.get<UserProfile>('/auth/profile');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      throw new Error('Falha ao buscar dados do perfil.');
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();
