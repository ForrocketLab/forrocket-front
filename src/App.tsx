import { Route, Routes } from 'react-router-dom';
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
import TalentMatrixPage from './pages/hr/TalentMatrixPage';
import TalentMatrixMethodology from './pages/hr/TalentMatrixMethodology';
import ManagerBrutalFacts from './pages/manager/brutal-facts/ManagerBrutalFacts';
import OKRsPage from './pages/okrs/OKRsPage';
import OKRDetailsPage from './pages/okrs/OKRDetailsPage';
import EditOKRPage from './pages/okrs/EditOKRPage';
import PDIsPage from './pages/pdis/PDIsPage';
import PDIDetailsPage from './pages/pdis/PDIDetailsPage';
import PDIForm from './pages/pdis/PDIForm';
import CollaboratorEvolution from './pages/manager/collaborators/CollaboratorEvolution';

function App() {
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
                <Route path='/evolution' element={<CollaboratorEvolution />} />
                <Route path='/okrs' element={<OKRsPage />} />
                <Route path='/okrs/:id' element={<OKRDetailsPage />} />
                <Route path='/okrs/:id/edit' element={<EditOKRPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.RH]} />}>
                <Route path='/rh' element={<HRHomePage />} />
                <Route path='/rh/colaboradores' element={<CollaboratorManagement />} />
                <Route path='/rh/criterios' element={<CriteriaManagement />} />
                <Route path='/rh/matriz-talento' element={<TalentMatrixPage />} />
                <Route path='/rh/matriz-talento/metodologia' element={<TalentMatrixMethodology />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COMMITTEE]} />}>
                <Route path='/committee' element={<CommitteePage />} />
                <Route path='/committee/equalizacoes' element={<EqualizacoesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
                <Route path='/manager/dashboard' element={<ManagerDashboardPage />} />
                <Route path='/manager/collaborators' element={<ManagerCollaborators />} />
                <Route path='/manager/collaborators/:id/evaluations' element={<CollaboratorEvaluationDetails />} />
                <Route path='/manager/brutal-facts' element={<ManagerBrutalFacts />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR]} />}>
                <Route path='/dashboard' element={<h1>Gestor</h1>} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR, ROLES.MANAGER, ROLES.RH]} />}>
                <Route path='/pdis' element={<PDIsPage />} />
                <Route path='/pdis/:id' element={<PDIDetailsPage />} />
                <Route path='/pdis/:id/edit' element={<PDIForm />} />
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
