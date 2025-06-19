import { createContext, useState, useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { ROLES } from '../types/roles';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  apiError: string | null;
  login: (data: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Props para o Provider
interface AuthProviderProps {
  children: ReactNode;
}

// Contexto com um valor padrão.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          // Se o token existe, busca os dados do usuário
          const userProfile = await AuthService.getProfile();
          setUser(userProfile); // Restaura a sessão do usuário
        } catch (error) {
          // Se o token for inválido/expirado, o getProfile falhará.
          // O authService já deve fazer o logout.
          console.error('Sessão inválida, limpando token.');
        }
      }
      setLoading(false); // Finaliza o carregamento
    };

    validateToken();
  }, []);

  const login = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      await AuthService.login(data);

      const userProfile = await AuthService.getProfile();

      setUser(userProfile);

      const dashboardPath = getPathByRoles(userProfile.roles || []);

      navigate(dashboardPath, { replace: true });
    } catch (err) {
      console.error('Falha no processo de login:', err);
      // Re-lança o erro para o LoginPage poder pegar no catch e exibir a mensagem de erro
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    apiError,
    login,
    logout,
  };

  const getPathByRoles = (roles: string[]): string => {
    if (roles.includes(ROLES.ADMIN)) return '/admin';
    if (roles.includes(ROLES.RH)) return '/rh';
    if (roles.includes(ROLES.MANAGER)) return '/manager';
    if (roles.includes(ROLES.COLLABORATOR)) return '/'; // Rota para colaborador
    return '/login'; // Fallback
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
