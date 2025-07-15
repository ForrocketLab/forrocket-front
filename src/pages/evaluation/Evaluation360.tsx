import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { ColleagueEvaluation } from './ColleagueEvaluation';
import EvaluationService, { WorkAgainMotivation } from '../../services/EvaluationService';
import { useGlobalToast } from '../../hooks/useGlobalToast';

interface Colleague {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  strengths: string;
  improvements: string;
  workAgainMotivation: WorkAgainMotivation;
}

const Evaluation360 = () => {
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useGlobalToast();

  // Carregar colaboradores avaliáveis
  useEffect(() => {
    const loadColleagues = async () => {
      try {
        setLoading(true);
        const response = await EvaluationService.getProjectCollaborators360();

        console.log('Resposta da API (novo endpoint):', response);

        // Verificar se a resposta é um array
        if (!Array.isArray(response)) {
          console.error('Resposta da API não é um array:', response);
          throw new Error('Formato de resposta inválido da API');
        }

        // Mapear diretamente a resposta para o formato esperado
        const mappedColleagues: Colleague[] = response.map(colleague => ({
          id: colleague.id,
          name: colleague.name,
          role: colleague.role,
          initials: colleague.initials,
          rating: colleague.rating,
          strengths: colleague.strengths,
          improvements: colleague.improvements,
          workAgainMotivation: colleague.workAgainMotivation,
        }));

        setColleagues(mappedColleagues);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        toast.error('Erro ao carregar dados', 'Não foi possível carregar os colaboradores para avaliação.');

        // Fallback com dados de exemplo em caso de erro
        const fallbackColleagues: Colleague[] = [
          {
            id: 'fallback-1',
            name: 'Colaborador Exemplo',
            role: 'Desenvolvedor',
            initials: 'CE',
            rating: 0,
            strengths: '',
            improvements: '',
            workAgainMotivation: WorkAgainMotivation.NEUTRAL,
          },
        ];
        setColleagues(fallbackColleagues);
      } finally {
        setLoading(false);
      }
    };

    loadColleagues();
  }, []);

  const handleColleagueUpdate = (colleagueId: string, updates: Partial<Colleague>) => {
    setColleagues(prev =>
      prev.map(colleague => (colleague.id === colleagueId ? { ...colleague, ...updates } : colleague)),
    );
  };

  const filteredColleagues = colleagues.filter(
    colleague =>
      colleague.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colleague.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const completedEvaluations = colleagues.filter(c => c.rating > 0).length;
  const totalColleagues = colleagues.length;
  const progress = totalColleagues > 0 ? (completedEvaluations / totalColleagues) * 100 : 0;

  //   const handleSave = () => {
  //     alert('Avaliações salvas com sucesso!');
  //   };

  //   const handleSubmit = () => {
  //     if (completedEvaluations < totalColleagues) {
  //       alert('Por favor, complete todas as avaliações antes de enviar.');
  //       return;
  //     }
  //     alert('Avaliações enviadas para análise!');
  //   };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-6 py-6'>
        {/* Progress Overview */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm mb-6'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Progresso da Avaliação</h2>
              <div className='flex items-center gap-2'>
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border'>
                  {completedEvaluations}/{totalColleagues} avaliados
                </span>
                <span className='text-2xl font-bold text-blue-600'>{progress.toFixed(0)}%</span>
              </div>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all duration-500'
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className='text-sm text-gray-600 mt-2'>
              Avalie todos os seus colegas de equipe para completar a avaliação 360°
            </p>
          </div>
        </div>

        {/* Search */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm mb-6'>
          <div className='p-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Buscar por colaboradores'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              />
            </div>
          </div>
        </div>

        {/* Colleagues List */}
        <div className='space-y-4'>
          {loading ? (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
                <p className='text-gray-600'>Carregando colaboradores...</p>
              </div>
            </div>
          ) : filteredColleagues.length > 0 ? (
            filteredColleagues.map(colleague => (
              <ColleagueEvaluation
                key={colleague.id}
                id={colleague.id}
                name={colleague.name}
                role={colleague.role}
                initials={colleague.initials}
                rating={colleague.rating}
                strengths={colleague.strengths}
                improvements={colleague.improvements}
                workAgainMotivation={colleague.workAgainMotivation}
                onRatingChange={rating => handleColleagueUpdate(colleague.id, { rating })}
                onStrengthsChange={strengths => handleColleagueUpdate(colleague.id, { strengths })}
                onImprovementsChange={improvements => handleColleagueUpdate(colleague.id, { improvements })}
                onWorkAgainMotivationChange={workAgainMotivation =>
                  handleColleagueUpdate(colleague.id, { workAgainMotivation })
                }
              />
            ))
          ) : (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador para avaliar'}
                </h3>
                <p className='text-gray-600'>
                  {searchTerm
                    ? 'Tente buscar com outros termos ou limpe o filtro'
                    : 'Não há colaboradores disponíveis para avaliação no momento'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Evaluation360;
