import { type FC, useEffect } from 'react';
import { Brain, Sparkles, Copy, AlertCircle, CheckCircle, Clock, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { usePersonalInsights } from '../hooks/usePersonalInsights';
import { type PersonalInsightsRequest } from '../services/PersonalInsightsService';
import { useGlobalToast } from '../hooks/useGlobalToast';

interface PersonalInsightsCardProps {
  collaboratorId: string;
  collaboratorName: string;
  cycle: string;
  onInsightsGenerated?: (insights: string) => void;
}

const PersonalInsightsCard: FC<PersonalInsightsCardProps> = ({ 
  collaboratorId, 
  collaboratorName, 
  cycle,
  onInsightsGenerated 
}) => {
  const toast = useGlobalToast();
  const { 
    generateInsights, 
    checkExistingInsights,
    clearInsights, 
    insights, 
    loading, 
    checkingExisting,
    error 
  } = usePersonalInsights();

  // Verificar se já existe insights quando o componente é montado
  useEffect(() => {
    const checkExisting = async () => {
      try {
        await checkExistingInsights(collaboratorId, cycle);
      } catch (error) {
        console.error('Erro ao verificar insights existentes:', error);
      }
    };
    
    checkExisting();
  }, [collaboratorId, cycle]);

  const handleGenerateInsights = async () => {
    try {
      const request: PersonalInsightsRequest = {
        collaboratorId,
        cycle
      };
      
      const result = await generateInsights(request);
      
      if (onInsightsGenerated) {
        onInsightsGenerated(result.insights);
      }
      
      toast.success('Insights Gerados!', 'Seus insights personalizados foram gerados com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      toast.error('Erro ao Gerar Insights', 'Não foi possível gerar seus insights personalizados. Tente novamente.');
    }
  };

  const handleCopyInsights = async () => {
    if (!insights) return;

    const textToCopy = `
INSIGHTS PERSONALIZADOS - ${insights.collaboratorName}
Cargo: ${insights.jobTitle}
Ciclo: ${insights.cycle}
Sua Média: ${insights.averageScore.toFixed(2)}/5

INSIGHTS PERSONALIZADOS:
${insights.insights}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Insights Copiados!', 'Seus insights foram copiados para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao Copiar', 'Não foi possível copiar os insights. Tente novamente.');
    }
  };

  // Estado de verificação de insights existentes
  if (checkingExisting) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-600">Verificando insights existentes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Insights Personalizados</h3>
            <p className="text-sm text-gray-600">Dicas e análise personalizada para seu desenvolvimento</p>
          </div>
        </div>
        
        {!insights && !loading && (
          <button
            onClick={handleGenerateInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-4 h-4" />
            🚀 Gerar Insights
          </button>
        )}

        {insights && !loading && (
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-600">Gerando seus insights personalizados...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Erro ao gerar insights</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleGenerateInsights}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={clearInsights}
              className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Insights Content */}
      {insights && (
        <div className="space-y-4">
          {/* Header Info */}
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{insights.averageScore.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Sua Média</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{cycle}</div>
                <div className="text-xs text-gray-600">Ciclo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {insights.averageScore >= 4.0 ? 'Alto' : insights.averageScore >= 3.0 ? 'Médio' : 'Baixo'}
                </div>
                <div className="text-xs text-gray-600">Performance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  <TrendingUp className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-xs text-gray-600">Desenvolvimento</div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Seus Insights Personalizados
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyInsights}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar insights"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-l-4 border-purple-400">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {insights.insights}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card - Mostra quando não há insights */}
      {!insights && !loading && !error && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-900 mb-1">
                💡 Insights ainda não gerados
              </h4>
              <p className="text-sm text-purple-800 mb-3">
                Clique em "🚀 Gerar Insights" para criar uma análise personalizada das suas avaliações e receber dicas práticas para seu desenvolvimento.
              </p>
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-sm text-purple-800">
                  <strong>A IA analisará:</strong>
                </p>
                <ul className="text-sm text-purple-800 space-y-1 mt-2">
                  <li>• <strong>Seus pontos fortes</strong> identificados nas avaliações</li>
                  <li>• <strong>Oportunidades de crescimento</strong> personalizadas</li>
                  <li>• <strong>Padrões comportamentais</strong> observados pelos colegas</li>
                  <li>• <strong>Dicas práticas</strong> para melhorar sua performance</li>
                  <li>• <strong>Próximos passos</strong> para seu desenvolvimento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInsightsCard; 