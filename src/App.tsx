import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/Login';
import { AuthProvider } from './contexts/AuthProvider';
import HomePage from './pages/home/Home';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
