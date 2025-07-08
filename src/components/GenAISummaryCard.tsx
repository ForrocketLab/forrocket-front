import { type FC, useEffect } from 'react';
import { Brain, Sparkles, Copy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useGenAISummary } from '../hooks/useCommittee';
import { type GenAISummaryRequest } from '../services/CommitteeService';
import { useGlobalToast } from '../hooks/useGlobalToast';
import MarkdownRenderer from './MarkdownRenderer';

interface GenAISummaryCardProps {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  onSummaryGenerated?: (summary: string) => void;
}

const GenAISummaryCard: FC<GenAISummaryCardProps> = ({ 
  collaboratorId, 
  cycle,
  onSummaryGenerated 
}) => {
  const toast = useGlobalToast();
  const { 
    generateSummary, 
    checkExistingSummary,
    clearSummary, 
    summary, 
    loading, 
    checkingExisting,
    error 
  } = useGenAISummary();

  // Verificar se já existe um resumo quando o componente é montado
  useEffect(() => {
    const checkExisting = async () => {
      try {
        await checkExistingSummary(collaboratorId, cycle);
      } catch (error) {
        console.error('Erro ao verificar resumo existente:', error);
      }
    };
    
    checkExisting();
  }, [collaboratorId, cycle]);

  const handleGenerateSummary = async () => {
    try {
      const request: GenAISummaryRequest = {
        collaboratorId,
        cycle
      };
      
      const result = await generateSummary(request);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(result.summary);
      }
      
      toast.success('Resumo Gerado!', 'O resumo por IA foi gerado com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao Gerar Resumo', 'Não foi possível gerar o resumo por IA. Tente novamente.');
    }
  };

  const handleCopySummary = async () => {
    if (!summary) return;

    const textToCopy = `
RESUMO DE AVALIAÇÃO - ${summary.collaboratorName}
Cargo: ${summary.jobTitle}
Ciclo: ${summary.cycle}
Média Geral: ${summary.averageScore}
Total de Avaliações: ${summary.totalEvaluations}

ANÁLISE DA IA:
${summary.summary}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Resumo Copiado!', 'O resumo foi copiado para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao Copiar', 'Não foi possível copiar o resumo. Tente novamente.');
    }
  };

  // Estado de verificação de resumo existente
  if (checkingExisting) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Verificando resumo existente...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Resumo Automatizado</h3>
            <p className="text-sm text-gray-600">Análise inteligente das avaliações</p>
          </div>
        </div>
        
        {!summary && !loading && (
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            🚀 Iniciar Análise IA
          </button>
        )}

        {summary && !loading && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              Já Gerado
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Gerando resumo inteligente...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Erro ao gerar resumo</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleGenerateSummary}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={clearSummary}
              className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Summary Content */}
      {summary && (
        <div className="space-y-4">
          {/* Header Info */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.averageScore.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Média Geral</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.totalEvaluations}</div>
                <div className="text-xs text-gray-600">Total Avaliações</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{summary.cycle}</div>
                <div className="text-xs text-gray-600">Ciclo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {summary.averageScore >= 4.0 ? 'Alto' : summary.averageScore >= 3.0 ? 'Médio' : 'Baixo'}
                </div>
                <div className="text-xs text-gray-600">Performance</div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                Análise da Inteligência Artificial
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar resumo"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-400">
                <MarkdownRenderer content={summary.summary} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card - Mostra quando não há resumo */}
      {!summary && !loading && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                ⏳ Resumo não gerado ainda
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Clique em "🚀 Iniciar Análise IA" para criar uma análise inteligente das avaliações deste colaborador.
              </p>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>A IA analisará:</strong>
                </p>
                <ul className="text-sm text-blue-800 space-y-1 mt-2">
                  <li>• <strong>Consistência</strong> entre diferentes tipos de avaliação</li>
                  <li>• <strong>Padrões</strong> nas notas e feedbacks</li>
                  <li>• <strong>Pontos fortes</strong> e áreas de desenvolvimento</li>
                  <li>• <strong>Recomendação estratégica</strong> para equalização</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAISummaryCard; 