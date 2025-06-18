import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';
import EvaluationCicle from './pages/evaluation/EvaluationCicle';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/evaluation' element={<EvaluationCicle />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
