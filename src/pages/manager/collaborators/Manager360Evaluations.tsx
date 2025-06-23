import { useState, useEffect } from 'react';
import SearchBar from '../../../components/SearchBar';
import EvaluationCard from '../collaboratorEvaluations/components/EvaluationCollaboratorCard';
import ManagerService from '../../../services/ManagerService';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../../components/LoadingSpinner';

const Manager360Evaluations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams();
  const [evaluations, setEvaluations] = useState<Received360Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.evaluatorName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const { name } = await ManagerService.getActiveCycle();
        const data = await ManagerService.getReceived360Assessments(id, name);
        setEvaluations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [id]);

  return (
    <div className='p-4 md:p-8 bg-gray-100 min-h-screen'>
      {/* Barra de Busca */}
      <div className='mb-6'>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder='Buscar por avaliador...' />
      </div>

      {/* Container para a lista de avaliações */}
      <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200'>
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <LoadingSpinner />
          </div>
        ) : (
          filteredEvaluations.map((evaluation, index) => <EvaluationCard key={index} {...evaluation} />)
        )}
      </div>
    </div>
  );
};

export default Manager360Evaluations;
