import Sidebar from '../../components/Sidebar';

const EvaluationPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-48 bg-gray-50 p-8">
        {/* Conteúdo da página de avaliação */}
      </main>
    </div>
  );
};

export default EvaluationPage;