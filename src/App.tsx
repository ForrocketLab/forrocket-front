import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';
import HRHomePage from './pages/hr/HRHome';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './types/roles';
import MainLayout from './components/MainLayout';
import NotFoundPage from './pages/not-found/NotFound';
import CommitteePage from './pages/committee/Committee';
import EqualizacoesPage from './pages/committee/Equalizacoes';
import ToastContainer from './components/ToastContainer';
import { useToastSubscription } from './hooks/useGlobalToast';
import ManagerCollaboratorEvaluations from './pages/manager/collaboratorEvaluations/ManagerCollaboratorEvaluations';
import ManagerDashboardPage from './pages/manager/dashboard/ManagerDashboard';
import CollaboratorEvaluationDetails from './pages/manager/collaborators/CollaboratorEvaluationDetails';
import ManagerCollaborators from './pages/manager/collaborators/ManagerCollaborators';
import CollaboratorManagement from './pages/hr/CollaboratorManagement';
import CriteriaManagement from './pages/hr/CriteriaManagement';
import EvaluationPage from './pages/evaluation/EvaluationCycle';
import { EvaluationProvider } from './contexts/EvaluationProvider';
import AdminHomePage from './pages/admin/AdminHome';
import UserManagement from './pages/admin/UserManagement';
import CycleManagement from './pages/admin/CycleManagement';
import PhaseControl from './pages/admin/PhaseControl';
import AdminReports from './pages/admin/AdminReports';
import AuditLogPage from './pages/admin/AuditLog';

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
        <EvaluationProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path='/login' element={<LoginPage />} />
            <Route path='/unauthorized' element={<h1>Não autorizado</h1>} />

            {/* Rotas protegidas com layout padrão (SideMenu incluso) */}
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path='/admin' element={<AdminHomePage />} />
                <Route path='/admin/users' element={<UserManagement />} />
                <Route path='/admin/cycles' element={<CycleManagement />} />
                <Route path='/admin/phase-control' element={<PhaseControl />} />
                <Route path='/admin/reports' element={<AdminReports />} />
                <Route path='/admin/auditlog' element={<AuditLogPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR]} />}>
                <Route path='/' element={<HomePage />} />
                <Route path='/avaliacao' element={<EvaluationPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.RH]} />}>
                <Route path='/rh' element={<HRHomePage />} />
                <Route path='/rh/colaboradores' element={<CollaboratorManagement />} />
                <Route path='/rh/criterios' element={<CriteriaManagement />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COMMITTEE]} />}>
                <Route path='/committee' element={<CommitteePage />} />
                <Route path='/committee/equalizacoes' element={<EqualizacoesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
                <Route path='/manager/dashboard' element={<ManagerDashboardPage />} />
                <Route path='/manager/collaborators' element={<ManagerCollaborators />} />
                <Route path='/manager/collaborators/:collaboratorId' element={<ManagerCollaboratorEvaluations />} />
                <Route path='/manager/collaborators/:id/evaluations' element={<CollaboratorEvaluationDetails />} />
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
        </EvaluationProvider>
      </AuthProvider>
    </>
  );
}

export default App;