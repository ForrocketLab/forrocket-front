import { type FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import DashboardService from '../../../services/DashboardService';
import { type DetailedSelfAssessment, type SelfAssessmentAnswer } from '../../../types/detailedEvaluations';

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

  const collaboratorPlaceholderName = "Colaborador Avaliado";
  const collaboratorJobTitle = "Product Design";

  useEffect(() => {
    if (!collaboratorIdFromUrl) {
      setError('ID do colaborador não fornecido na URL.');
      setIsLoading(false);
      return;
    }

    const fetchDetailedSelfAssessment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const selfAssessment = await DashboardService.getDetailedSelfAssessment(collaboratorIdFromUrl);
        setDetailedSelfAssessment(selfAssessment);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar a autoavaliação detalhada.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedSelfAssessment();
  }, [collaboratorIdFromUrl]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        <p className="ml-4 text-gray-700">Carregando autoavaliação detalhada...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!detailedSelfAssessment) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Autoavaliação detalhada não encontrada</h3>
            <p className="text-gray-600 mb-4">Verifique se o colaborador possui uma autoavaliação para o ciclo atual.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors"
            >
              Voltar para Colaboradores
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCriterionName = (criterionId: string): string => {
    switch (criterionId) {
      case 'atender-prazos': return 'Atender Prazos';
      case 'capacidade-aprender': return 'Capacidade de Aprender';
      case 'entregar-qualidade': return 'Entregar Qualidade';
      case 'evolucao-rocket': return 'Evolução Rocket';
      case 'fazer-mais-menos': return 'Fazer Mais com Menos';
      case 'gestao-gente': return 'Gestão de Pessoas';
      case 'gestao-resultados': return 'Gestão de Resultados';
      case 'organizacao-trabalho': return 'Organização no Trabalho';
      case 'pensar-fora-caixa': return 'Pensar Fora da Caixa';
      case 'resiliencia-adversidades': return 'Resiliência às Adversidades';
      case 'sentimento-de-dono': return 'Sentimento de Dono';
      case 'team-player': return 'Ser "team player"';
      default: return criterionId.replace(/-/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const collaboratorInitials = getInitials(collaboratorPlaceholderName);

  const toggleCriterionExpansion = (criterionId: string) => {
    setExpandedCriterion(prevId => (prevId === criterionId ? null : criterionId));
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
        <header className='fixed top-0 left-[256px] right-0 bg-white z-10 shadow-sm'>
            <div className='h-20 w-full flex items-center justify-between border-b border-[#f3f3f3] text-lg px-8'>
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className='text-black font-bold text-xl'>Detalhes da Avaliação</h1>
                </div>
                <div className='flex items-center gap-3'>
                    <span className='bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-[#085F60] text-sm uppercase'>
                        {collaboratorInitials}
                    </span>
                    <div className='flex flex-col'>
                        <span className='text-sm font-bold text-gray-800'>{collaboratorPlaceholderName}</span>
                        <span className='text-xs text-gray-500'>{collaboratorJobTitle}</span>
                    </div>
                </div>
            </div>

            <div className='bg-white h-10 flex items-center px-8 text-sm border-b border-[#f3f3f3]'>
                <button className="font-semibold text-sm cursor-pointer text-[#085F60] underline underline-offset-4 decoration-2 px-4 py-1.5">
                    Avaliação <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                </button>
                <button className="font-medium text-sm cursor-pointer text-gray-700 hover:text-[#085F60] px-4 py-1.5">
                    Avaliação 360
                </button>
                <button className="font-medium text-sm cursor-pointer text-gray-700 hover:text-[#085F60] px-4 py-1.5">
                    Histórico
                </button>
            </div>
        </header>

        <main className="flex-1 p-8 pt-[140px]">
            <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Critérios de Postura</h3>

                {detailedSelfAssessment.answers.length > 0 ? (
                    detailedSelfAssessment.answers.map((answer: SelfAssessmentAnswer) => (
                        <div key={answer.id} className="bg-white rounded-lg shadow-sm mb-4 border border-gray-200">
                            {/* Cabeçalho do Critério (clicável para expandir) */}
                            <button
                                className="w-full text-left p-5 flex items-center justify-between"
                                onClick={() => toggleCriterionExpansion(answer.criterionId)}
                            >
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <h4 className="font-bold text-gray-800 text-md">{getCriterionName(answer.criterionId)}</h4>
                                </div>
                                {/* Apenas o Ícone de Expansão/Contração */}
                                <div className="flex items-center">
                                    {expandedCriterion === answer.criterionId ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </div>
                            </button>

                            {/* Conteúdo Expansível (Estrelas e Justificativa) */}
                            {expandedCriterion === answer.criterionId && (
                                <div className="px-5 pb-5 pt-3 border-t border-gray-200">
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-1">Autoavaliação</p>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((starValue) => (
                                                <Star
                                                    key={starValue}
                                                    className={`w-5 h-5 ${
                                                        starValue <= answer.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Justificativa</p>
                                        <p className="text-sm text-gray-800">{answer.justification || 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">Nenhum critério de autoavaliação detalhado encontrado.</p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default CollaboratorEvaluationDetails;