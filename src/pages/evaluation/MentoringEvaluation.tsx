import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { StarRating } from '../../components/StarRating';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import EvaluationService, { MentorAssessment } from '../../services/EvaluationService';

const MentoringEvaluation = () => {
  const [evaluations, setEvaluations] = useState<MentorAssessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const toast = useGlobalToast();

  useEffect(() => {
    const loadMentoringData = async () => {
      try {
        setLoading(true);
        const response = await EvaluationService.getMentorAssessments();
        setEvaluations(response);
      } catch (error) {
        console.error('Erro ao carregar mentores:', error);
        toast.error('Erro ao carregar dados', 'Não foi possível carregar os mentores para avaliação.');
      } finally {
        setLoading(false);
      }
    };

    loadMentoringData();
  }, []);

  const handleEvaluationUpdate = async (evaluationId: string, updates: Partial<MentorAssessment>) => {
    try {
      setUpdating(evaluationId);

      // Atualizar localmente primeiro para feedback imediato
      setEvaluations(prev =>
        prev.map(evaluation => (evaluation.id === evaluationId ? { ...evaluation, ...updates } : evaluation)),
      );

      // Enviar para o backend
      await EvaluationService.updateMentorAssessment(updates);

      console.log('Avaliação atualizada com sucesso para mentor:', evaluationId);
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      toast.error('Erro ao salvar', 'Não foi possível salvar a avaliação.');

      // Reverter mudança local em caso de erro
      // Para fazer isso, precisamos recarregar os dados do backend
      try {
        const response = await EvaluationService.getMentorAssessments();
        setEvaluations(response);
      } catch (reloadError) {
        console.error('Erro ao recarregar dados:', reloadError);
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRatingChange = (evaluationId: string, rating: number) => {
    handleEvaluationUpdate(evaluationId, { rating });
  };

  const filteredEvaluations = evaluations.filter(
    evaluation =>
      evaluation.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.mentorRole.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const completedEvaluations = evaluations.filter(e => e.rating > 0).length;
  const totalEvaluations = evaluations.length;
  const progress = totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * 100 : 0;

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
                {/* Loading overlay */}
                {updating === evaluation.id && (
                  <div className='absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                  </div>
                )}
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
