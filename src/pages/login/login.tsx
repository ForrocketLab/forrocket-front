import { useState, type FormEvent } from 'react';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('ana.oliveira@rocketcorp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await AuthService.login({ email, password });
      alert(`Login bem-sucedido! Bem-vinda, ${user.name}!`);
      // Aqui você redirecionaria o usuário para o dashboard, por exemplo:
      navigate('/');
    } catch (err) {
      setError('Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login RPE</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type='email' value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type='password' value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type='submit' disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
