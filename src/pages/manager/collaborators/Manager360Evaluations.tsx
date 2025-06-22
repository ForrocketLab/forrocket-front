import { type FC, useState, useEffect } from 'react';
import type { EvaluationCardProps } from '../collaboratorEvaluations/components/EvaluationCollaboratorCard';
import SearchBar from '../../../components/SearchBar';
import EvaluationCard from '../collaboratorEvaluations/components/EvaluationCollaboratorCard';
import ManagerService from '../../../services/ManagerService';
import { useParams } from 'react-router-dom';

// Dados mockados para exibição
const mockEvaluations: EvaluationCardProps[] = [
  {
    evaluatorInitials: 'BM',
    evaluatorName: 'Bruno Mendes',
    evaluatorJobTitle: 'Tech Lead',
    rating: 4.5,
    strengths:
      'Excelente liderança técnica e capacidade de desbloquear a equipe. Sempre disposto a ajudar e compartilhar conhecimento.',
    weaknesses: 'Poderia melhorar a organização das cerimônias de sprint para serem mais objetivas e curtas.',
  },
  {
    evaluatorInitials: 'CD',
    evaluatorName: 'Carla Dias',
    evaluatorJobTitle: 'Head of Engineering',
    rating: 4.0,
    strengths:
      'Visão estratégica clara e ótima comunicação com stakeholders. Consegue traduzir as necessidades de negócio para a equipe técnica.',
    weaknesses: 'Às vezes pode demorar a dar feedback sobre questões menos urgentes.',
  },
];

const Manager360Evaluations = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Lógica de filtro para a barra de busca
  const filteredEvaluations = mockEvaluations.filter(evaluation =>
    evaluation.evaluatorName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { id } = useParams();

  const [evaluations, setEvaluations] = useState<Received360Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

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
        {filteredEvaluations.map((evaluation, index) => (
          <EvaluationCard key={index} {...evaluation} />
        ))}
      </div>
    </div>
  );
};

export default Manager360Evaluations;
