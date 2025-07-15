import { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
import { StarRating } from '../../components/StarRating';
import { useEvaluation } from '../../hooks/useEvaluation';
import EvaluationService, { MentorAssessment } from '../../services/EvaluationService';

const MentoringEvaluation = () => {
  // Removido useState de evaluations, pois agora é derivado do contexto
  const [searchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useEvaluation();

  // Derivar lista de avaliações de mentores a partir do contexto
  const evaluations = useMemo(() => {
    if (Object.keys(state.mentoring).length > 0) {
      return Object.entries(state.mentoring).map(([id, data]) => ({
        id,
        mentorName: '', // Preencher se necessário, ou buscar de um cache inicial
        mentorRole: '',
        mentorInitials: '',
        rating: data.rating,
        justification: data.justification,
      }));
    }
    return [];
  }, [state.mentoring]);

  useEffect(() => {
    const loadMentoringData = async () => {
      setLoading(true);
      if (evaluations.length > 0) {
        setLoading(false);
        return;
      }
      // Só busca do backend se não houver nada no contexto
      try {
        const response = await EvaluationService.getMentorAssessments();
        // Preenche o contexto para as próximas vezes
        const contextData: Record<string, { rating: number; justification: string }> = {};
        response.forEach(evaluation => {
          contextData[evaluation.id] = {
            rating: evaluation.rating || 0,
            justification: evaluation.justification || '',
          };
        });
        dispatch({ type: 'SET_MENTORING', payload: contextData });
      } catch (error) {
        console.error('Erro ao carregar mentores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMentoringData();
    // eslint-disable-next-line
  }, []);

  const handleEvaluationUpdate = async (evaluationId: string, updates: Partial<MentorAssessment>) => {
    // Atualizar contexto global - apenas salvar no contexto local
    dispatch({
      type: 'UPDATE_MENTORING',
      payload: {
        mentorId: evaluationId,
        data: {
          rating: updates.rating || 0,
          justification: updates.justification || '',
        },
      },
    });

    // Atualizar localmente para feedback imediato
    // setEvaluations(prev =>
    //   prev.map(evaluation => (evaluation.id === evaluationId ? { ...evaluation, ...updates } : evaluation)),
    // );

    // Remover requisição automática ao backend
    console.log('Avaliação atualizada localmente para mentor:', evaluationId);
  };

  const handleRatingChange = (evaluationId: string, rating: number) => {
    handleEvaluationUpdate(evaluationId, { rating });
  };

  const filteredEvaluations = evaluations.filter(
    evaluation =>
      evaluation.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.mentorRole.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-6 py-6'>
        {/* Mentoring Evaluations List */}
        <div className='space-y-4'>
          {loading ? (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
                <p className='text-gray-600'>Carregando mentores...</p>
              </div>
            </div>
          ) : filteredEvaluations.length > 0 ? (
            filteredEvaluations.map(evaluation => (
              <div key={evaluation.id} className='bg-white border border-gray-200 rounded-lg shadow-sm relative'>
                {/* Remover loading overlay */}
                <div className='p-6'>
                  {/* Header with mentor info */}
                  <div className='flex items-center mb-6'>
                    <div className='flex items-center gap-4'>
                      <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
                        <span className='text-lg font-semibold text-green-600'>{evaluation.mentorInitials}</span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>{evaluation.mentorName}</h3>
                        <p className='text-sm text-gray-600'>{evaluation.mentorRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating section */}
                  <div className='mb-6'>
                    <p className='text-sm text-gray-700 mb-3'>Avaliação geral do mentor</p>
                    <StarRating
                      rating={evaluation.rating}
                      onRatingChange={rating => handleRatingChange(evaluation.id, rating)}
                      size='lg'
                    />
                  </div>

                  {/* Overall feedback */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700 block'>Feedback Geral</label>
                    <textarea
                      placeholder='Justificativa'
                      value={evaluation.justification}
                      onChange={e => handleEvaluationUpdate(evaluation.id, { justification: e.target.value })}
                      className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {searchTerm ? 'Nenhum mentor encontrado' : 'Nenhum mentor para avaliar'}
                </h3>
                <p className='text-gray-600'>
                  {searchTerm
                    ? 'Tente buscar com outros termos ou limpe o filtro'
                    : 'Não há mentores disponíveis para avaliação no momento'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentoringEvaluation;
