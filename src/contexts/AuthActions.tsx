import { useEvaluation } from './EvaluationProvider';
import { useAuth } from '../hooks/useAuth';

export const useAuthActions = () => {
  const { logout: originalLogout } = useAuth();
  const { clearAllData } = useEvaluation();

  const logout = () => {
    clearAllData();
    originalLogout();
  };

  return { logout };
}; 