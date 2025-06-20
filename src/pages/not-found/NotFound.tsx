import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Página Não Encontrada</h1>
      <p>Desculpe, a página que você está procurando não existe.</p>
      <Link to='/' style={{ color: 'blue', textDecoration: 'underline' }}>
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFoundPage;
