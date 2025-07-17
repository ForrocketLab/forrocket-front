import { useState, useEffect, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { ColleagueEvaluation } from './ColleagueEvaluation';
import EvaluationService, { WorkAgainMotivation } from '../../services/EvaluationService';
import { useEvaluation } from '../../hooks/useEvaluation';

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

const Evaluation360 = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  // Removido useState de colleagues, pois agora é derivado do contexto
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useEvaluation();

  // Derivar lista de colegas a partir do contexto
  const colleagues = useMemo<Colleague[]>(() => {
    return Object.values(state.evaluation360)
      .map(data => ({
        id: data.id || '',
        name: data.name || '',
        role: data.role || '',
        initials: data.initials || '',
        rating: data.rating || 0,
        strengths: data.strengths || '',
        improvements: data.improvements || '',
        workAgainMotivation: (data.workAgainMotivation || '') as WorkAgainMotivation,
      }))
      .filter(c => c.id && c.name && c.role && c.initials);
  }, [state.evaluation360]);

  // Carregar colaboradores avaliáveis
  useEffect(() => {
    const loadColleagues = async () => {
      setLoading(true);
      if (Object.keys(state.evaluation360).length > 0) {
        setLoading(false);
        return;
      }
      // Só busca do backend se não houver nada no contexto
      try {
        const response = await EvaluationService.getProjectCollaborators360();
        // Preenche o contexto para as próximas vezes, incluindo todos os dados relevantes
        const contextData: Record<
          string,
          {
            id: string;
            name: string;
            role: string;
            initials: string;
            rating: number;
            strengths: string;
            improvements: string;
            workAgainMotivation: string;
          }
        > = {};
        response.forEach(colleague => {
          contextData[colleague.id] = {
            ...colleague, // inclui nome, cargo, iniciais, etc
            rating: colleague.rating || 0,
            strengths: colleague.strengths || '',
            improvements: colleague.improvements || '',
            workAgainMotivation: colleague.workAgainMotivation || '',
          };
        });
        dispatch({ type: 'SET_EVALUATION_360', payload: contextData });
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadColleagues();
    // eslint-disable-next-line
  }, []);

  const handleColleagueUpdate = (colleagueId: string, updates: Partial<Colleague>) => {
    // Atualizar contexto global enviando apenas os campos modificados
    dispatch({
      type: 'UPDATE_EVALUATION_360',
      payload: {
        colleagueId,
        data: updates, // Envia apenas os campos que foram alterados
      },
    });
  };

  const filteredColleagues = useMemo(
    () =>
      colleagues.filter(
        colleague =>
          colleague.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          colleague.role.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [colleagues, searchTerm],
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
                <span className='text-2xl font-bold text-[#085F60]'>{progress.toFixed(0)}%</span>
              </div>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-[#08605F] h-3 rounded-full transition-all duration-500'
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
                disabled={isReadOnly}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
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
                isReadOnly={isReadOnly}
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
