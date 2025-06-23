import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import { EvaluationProvider } from './contexts/EvaluationProvider';
import HomePage from './pages/home/Home';
import Sidebar from './components/Sidebar';
import EvaluationPage from './pages/evaluation/EvaluationCycle';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/avaliacao' element={<EvaluationPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EvaluationProvider>
          <AppContent />
        </EvaluationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
