import EvaluationForm from './components/EvaluationForm';

const SelfEvaluationReview = () => {
  const exampleData = {
    selfScore: 4.0,
    managerScore: null,
    completedCount: 2,
    totalCount: 5,
  };

  return (
    <div>
      <EvaluationForm
        title='Critérios de Postura'
        selfScore={exampleData.selfScore}
        managerScore={exampleData.managerScore}
        completedCount={exampleData.completedCount}
        totalCount={exampleData.totalCount}
      >
        {/* Futuramente, seus componentes de acordeão virão aqui */}
        <div>
          <p className='text-gray-500'>Espaço reservado para os acordeões de cada critério...</p>
        </div>
      </EvaluationForm>
    </div>
  );
};

export default SelfEvaluationReview;
