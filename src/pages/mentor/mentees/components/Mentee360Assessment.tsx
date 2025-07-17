import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, AlertTriangle } from 'lucide-react';
import MentorService, { MenteeFeedback360 } from '../../../../services/MentorService';
import { ReadonlyStarRating } from '../../../../components/ReadonlyStarRating';

// --- Componente refatorado ---
const Mentee360Assessment = () => {
  const { id: menteeId } = useParams<{ id: string }>();
  const [evaluations360, setEvaluations360] = useState<MenteeFeedback360[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Lógica de busca de dados ---
  useEffect(() => {
    const fetchData = async () => {
      if (!menteeId) {
        setError('ID do mentorado não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar o ciclo ativo
        const activeCycle = await MentorService.getActiveCycle();
        if (!activeCycle || !activeCycle.id) {
          throw new Error('Nenhum ciclo ativo encontrado');
        }

        // Buscar feedback 360 do mentee
        const evaluationsData = await MentorService.getMenteeFeedback360(menteeId, activeCycle.id);
        setEvaluations360(evaluationsData);
      } catch (err) {
        console.error('Erro ao carregar avaliações 360 do mentee:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Não foi possível carregar os dados. Tente novamente mais tarde.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [menteeId]);

  // --- Função auxiliar ---
  const getWorkAgainMotivationText = (motivation: string | null) => {
    if (!motivation) return 'Não informado';

    const motivationMap: { [key: string]: string } = {
      STRONGLY_AGREE: 'Concordo Totalmente',
      PARTIALLY_AGREE: 'Concordo Parcialmente',
      NEUTRAL: 'Neutro',
      PARTIALLY_DISAGREE: 'Discordo Parcialmente',
      STRONGLY_DISAGREE: 'Discordo Totalmente',
    };
    return motivationMap[motivation] || 'Não informado';
  };

  // --- Função para gerar iniciais ---
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- Estados de Carregamento, Erro e Vazio com a nova estilização ---
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#08605F] mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando avaliações 360°...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-sm text-center'>
        <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>Ocorreu um Erro</h3>
        <p className='text-gray-600'>{error}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 px-6 p-4 md:p-8'>
      <div className='max-w-6xl'>
        {/* Cabeçalho da Página */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Avaliações 360° do Mentee</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Visualização das avaliações que o mentorado recebeu de seus colegas de equipe.
          </p>
        </div>

        {/* Lista de Avaliações */}
        <div className='space-y-4'>
          {evaluations360.length > 0 ? (
            evaluations360.map(evaluation => (
              <div key={evaluation.id} className='bg-white border border-gray-200 rounded-lg shadow-sm'>
                <div className='p-6'>
                  {/* Cabeçalho do Colega Avaliador */}
                  <div className='flex items-center mb-6'>
                    <div className='flex items-center gap-4'>
                      <div className='h-12 w-12 rounded-full bg-[#08605F]/10 flex items-center justify-center'>
                        <span className='text-lg font-semibold text-[#08605F]'>
                          {getInitials(evaluation.author.name)}
                        </span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>{evaluation.author.name}</h3>
                        <p className='text-sm text-gray-600'>{evaluation.author.jobTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Avaliação e Motivação */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 block'>Avaliação Geral</label>
                      <div className='flex items-center gap-2'>
                        <ReadonlyStarRating rating={evaluation.overallScore} />
                        <span className='font-bold text-gray-800'>{evaluation.overallScore}/5</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 block'>
                        Trabalharia novamente com este colaborador?
                      </label>
                      <div className='w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm'>
                        {getWorkAgainMotivationText(evaluation.motivationToWorkAgain)}
                      </div>
                    </div>
                  </div>

                  {/* Seção de Feedbacks (Pontos Fortes e Melhorias) */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 block'>Pontos fortes</label>
                      <textarea
                        value={evaluation.strengths}
                        disabled
                        className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed outline-none text-sm'
                        placeholder='Nenhum ponto forte foi descrito.'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 block'>Pontos de melhoria</label>
                      <textarea
                        value={evaluation.improvements}
                        disabled
                        className='w-full min-h-[100px] resize-none p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed outline-none text-sm'
                        placeholder='Nenhum ponto de melhoria foi descrito.'
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-10 text-center'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Nenhuma avaliação 360° encontrada</h3>
                <p className='text-sm text-gray-600'>
                  O mentee ainda não recebeu avaliações 360° ou os dados não estão disponíveis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentee360Assessment;
