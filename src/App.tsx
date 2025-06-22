import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import { EvaluationProvider } from './contexts/EvaluationProvider';
import HomePage from './pages/home/Home';
import Sidebar from './components/Sidebar';
import EvaluationPage from './pages/evaluation/EvaluationCycle';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EvaluationProvider>
          <Sidebar />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/avaliacao' element={<EvaluationPage />} />
            <Route path='/login' element={<LoginPage />} />
          </Routes>
        </EvaluationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
