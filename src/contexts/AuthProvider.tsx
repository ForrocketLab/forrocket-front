import { createContext, useState, useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

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
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const userProfile = await AuthService.getProfile();
          setUser(userProfile);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('authToken');
          console.error('Sessão inválida, fazendo logout.');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (data: LoginCredentials) => {
    setLoading(true);
    setApiError(null);
    try {
      await AuthService.login(data);
      setToken(localStorage.getItem('authToken'));

      // Após o login, buscamos o perfil completo para ter todos os dados no contexto.
      const userProfile = await AuthService.getProfile();
      setUser(userProfile);

      alert(`Login bem-sucedido! Bem-vindo(a), ${userProfile.name}!`);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Ocorreu um erro desconhecido.');
      }
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
    isAuthenticated: !!token,
    user,
    loading,
    apiError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
