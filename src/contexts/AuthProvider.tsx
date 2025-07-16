import { createContext, useState, useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { ROLES } from '../types/roles';
import type { UserProfile, LoginCredentials } from '../types/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  apiError: string | null;
  login: (data: LoginCredentials) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = AuthService.getToken();

      if (storedToken) {
        try {
          const userProfile = await AuthService.getProfile();
          setUser(userProfile);
          setToken(storedToken);
        } catch {
          AuthService.logout();
          setUser(null);
          setToken(null);
        }
      }

      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (data: LoginCredentials) => {
    setLoading(true);
    setApiError(null);

    try {
      await AuthService.login(data);
      const userProfile = await AuthService.getProfile();

      setUser(userProfile);
      setToken(AuthService.getToken());

      const dashboardPath = getPathByRoles(userProfile.roles || []);
      navigate(dashboardPath, { replace: true });
    } catch (err: any) {
      setApiError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const getPathByRoles = (roles: string[]): string => {
    if (roles.includes(ROLES.ADMIN)) return '/admin';
    if (roles.includes(ROLES.RH)) return '/rh';
    if (roles.includes(ROLES.COMMITTEE)) return '/committee';
    if (roles.includes(ROLES.MANAGER)) return '/manager/dashboard';
    if (roles.includes(ROLES.COLLABORATOR)) return '/';
    return '/login';
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f0f0f0',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        <div style={{ marginTop: '20px' }}>Verificando autenticação...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, apiError, login, logout }}>{children}</AuthContext.Provider>;
};
