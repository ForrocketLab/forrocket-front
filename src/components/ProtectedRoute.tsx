import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  console.log('autenticado', isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // checa se alguma role dop usuário tem permissão pra acessar a rota
  const isAuthorized = user?.roles.some(role => allowedRoles.includes(role));

  console.log('isAuthorized', isAuthorized);

  user?.roles.forEach(role => {
    console.log(`Usuário tem a role: ${role}`);
  });

  allowedRoles.forEach(role => {
    console.log(`Rota permite a role: ${role}`);
  });

  if (!isAuthorized) {
    return <Navigate to='/unauthorized' replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
