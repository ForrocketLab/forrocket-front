import { AxiosError } from 'axios';
import api from '../api';

class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  // Realiza o login do usuário na API.
  async login(credentials: LoginCredentials): Promise<UserInfo> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { token, user } = response.data;

      // Armazena o token no localStorage
      localStorage.setItem(this.TOKEN_KEY, token);

      console.log('Login bem-sucedido!', user);
      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof AxiosError && error.response) {
        // Lança o erro da API
        throw new Error(error.response.data.message || 'Falha ao tentar fazer login.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  // Realiza o logout do usuário (remove token do localStorage)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('Usuário deslogado.');
  }

  // Busca o perfil completo do usuário autenticado.
  async getProfile(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Nenhum token de autenticação encontrado.');
    }

    try {
      const response = await api.get<UserProfile>('/auth/profile');

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Se o token for inválido/expirado, faz o logout para limpar o estado
        this.logout();
        throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
      }
      throw new Error('Falha ao buscar dados do perfil.');
    }
  }

  // Retorna o token de autenticação armazenado.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Verifica se o usuário está autenticado (se existe um token).
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();
