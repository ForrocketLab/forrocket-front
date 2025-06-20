import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './types/roles';
import MainLayout from './components/MainLayout';
import NotFoundPage from './pages/not-found/NotFound';
import ManagerDashboard from './pages/manager/dashboard/ManagerDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/unauthorized' element={<h1>Não autorizado</h1>} />

          {/* Rotas protegidas com layout padrão (SideMenu incluso) */}
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path='/admin' element={<HomePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR]} />}>
              <Route path='/' element={<HomePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.RH]} />}>
              <Route path='/rh' element={<h1>RH</h1>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.COMMITTEE]} />}>
              <Route path='/commitee' element={<h1>Comitê</h1>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
              <Route path='/manager/dashboard' element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR]} />}>
              <Route path='/dashboard' element={<h1>Gestor</h1>} />
            </Route>

            {/* ROTA DE FALLBACK (404) */}
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
