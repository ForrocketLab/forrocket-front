import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/Login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './types/roles';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/unauthorized' element={<h1>Não autorizado</h1>} />

          <Route element={<MainLayout />}>
            {/* Fluxo do Admin */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path='/admin' element={<HomePage />} />
            </Route>

            {/* Fluxo do Colaborador */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.COLLABORATOR, ROLES.ADMIN]} />}>
              <Route path='/' element={<HomePage />} />
            </Route>

            {/* Fluxo do RH */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.RH, ROLES.ADMIN]} />}>
              <Route path='/rh' element={<h1>RH</h1>} />
            </Route>

            {/* Fluxo do Colaborador */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.COMMITTEE, ROLES.ADMIN]} />}>
              <Route path='/commitee' element={<h1>RH</h1>} />
            </Route>

            {/* Fluxo do Gestor */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.ADMIN]} />}>
              <Route path='/manager' element={<h1>RH</h1>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
