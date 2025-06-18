import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';

const HomePage = () => {
  const auth = useContext(AuthContext);

  if (!auth) return <p>Contexto não disponível</p>;

  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold'>Home</h1>
      <p className='mt-4 text-lg'>
        Token atual: {auth.user?.roles.join(', ') || 'Nenhum token disponível'}
        <br />
        <br />
        <code className='text-sm text-gray-700'>{auth.isAuthenticated ? 'Autenticado' : 'Não autenticado'}</code>
      </p>
      {auth.user && (
        <div className='mt-4'>
          <p>Usuário: {auth.user.name}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
