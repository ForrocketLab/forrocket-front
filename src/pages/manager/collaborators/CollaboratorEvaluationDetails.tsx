import { type FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CommitteeService, { type CollaboratorEvaluationSummary } from '../../../services/CommitteeService';

const CollaboratorEvaluationDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [evaluationSummary, setEvaluationSummary] = useState<CollaboratorEvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID do colaborador não fornecido na URL.');
      setIsLoading(false);
      return;
    }

    const fetchEvaluationDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const summary = await CommitteeService.getCollaboratorEvaluationSummary(id);
        setEvaluationSummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar os detalhes da avaliação.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        <p className="ml-4 text-gray-700">Carregando detalhes da avaliação...</p>
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

  if (!evaluationSummary) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dados de avaliação não encontrados</h3>
            <p className="text-gray-600 mb-4">Verifique se o colaborador possui avaliações no ciclo ativo.</p>
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

  // Função auxiliar para renderizar barras de pontuação (reutilizada de Equalizacoes.tsx)
  const renderScoreBar = (score: number | null, label: string) => {
    const percentage = score ? (score / 5) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-[#085F60]">{score || 'N/A'}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-[#085F60] rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        {/* Botão de Voltar */}
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Detalhes da Avaliação</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Avaliações do Colaborador: {evaluationSummary.collaborator.name}
        </h2>
        <p className="text-gray-600 mb-6">
          Cargo: {evaluationSummary.collaborator.jobTitle} - Ciclo: {evaluationSummary.cycle}
        </p>

        {/* Informações do Colaborador (similares ao Comitê, mas mais simples) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Notas Consolidadas</h4>
            {renderScoreBar(evaluationSummary.evaluationScores.selfAssessment, 'Autoavaliação')}
            {renderScoreBar(evaluationSummary.evaluationScores.assessment360, 'Avaliação 360')}
            {renderScoreBar(evaluationSummary.evaluationScores.managerAssessment, 'Avaliação Gestor')}
            {renderScoreBar(evaluationSummary.evaluationScores.mentoring, 'Mentoring')}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <h4 className="text-md font-semibold text-blue-900 mb-2">Resumo Consolidado</h4>
            <p className="text-sm text-blue-800">
              {evaluationSummary.customSummary || 'Nenhum resumo personalizado disponível.'}
            </p>
          </div>
        </div>

        {/* Seção para Avaliação do Comitê - AGORA SERÁ EXIBIDA */}
        {evaluationSummary.committeeAssessment && (
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400 mb-6">
            <h4 className="text-md font-semibold text-green-900 mb-3">Avaliação de Comitê</h4>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{evaluationSummary.committeeAssessment.author.name}</p>
                <p className="text-sm text-gray-600">Membro do Comitê</p>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-lg font-bold">
                {evaluationSummary.committeeAssessment.finalScore}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>Justificativa:</strong></p>
              <p className="mt-1">{evaluationSummary.committeeAssessment.justification}</p>
              {evaluationSummary.committeeAssessment.observations && (
                <>
                  <p className="mt-2"><strong>Observações:</strong></p>
                  <p className="mt-1">{evaluationSummary.committeeAssessment.observations}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Seção para Avaliação do Gestor (mantido como está, com a mensagem atual) */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Sua Avaliação (como Gestor)</h4>
          {evaluationSummary.managerAssessmentsReceived && evaluationSummary.managerAssessmentsReceived.length > 0 ? (
            <div>
              {/* Exemplo de como acessar alguns dados */}
              <p className="text-sm text-gray-700 mb-2">
                Nota Geral: <span className="font-medium">{evaluationSummary.evaluationScores.managerAssessment || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-700">
                Data: <span className="font-medium">{new Date(evaluationSummary.managerAssessmentsReceived[0].createdAt).toLocaleDateString()}</span>
              </p>

              <p className="mt-4 text-gray-600">
                detalhes da avaliação
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Você ainda não submeteu uma avaliação formal para este colaborador neste ciclo.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CollaboratorEvaluationDetails;