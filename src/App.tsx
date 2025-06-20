import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './types/roles';
import MainLayout from './components/MainLayout';
import NotFoundPage from './pages/not-found/NotFound';
import ManagerDashboard from './pages/manager/dashboard/ManagerDashboard';
import CommitteePage from './pages/committee/Committee';
import EqualizacoesPage from './pages/committee/Equalizacoes';
import ToastContainer from './components/ToastContainer';
import { useToastSubscription } from './hooks/useGlobalToast';
import RefPage from './pages/referencias/RefCollaborator';


function App() {
  return (
    <BrowserRouter>
      <AppWithToasts />
    </BrowserRouter>
  );
}

function AppWithToasts() {
  const { toasts, removeToast } = useToastSubscription();

  return (
    <>
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
                <Route path='/avaliacao' element={<RefPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.RH]} />}>
                <Route path='/rh' element={<h1>RH</h1>} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COMMITTEE]} />}>
                <Route path='/committee' element={<CommitteePage />} />
                <Route path='/committee/equalizacoes' element={<EqualizacoesPage />} />
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
        
        {/* Toast Container Global */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </AuthProvider>
    </>
  );
}

export default App;
