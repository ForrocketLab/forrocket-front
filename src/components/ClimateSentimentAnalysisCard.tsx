import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Copy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ClimateService, { ClimateSentimentAnalysis } from '../services/ClimateService';
import { useGlobalToast } from '../hooks/useGlobalToast';
import MarkdownRenderer from './MarkdownRenderer';

interface ClimateSentimentAnalysisCardProps {
  onAnalysisGenerated?: (analysis: ClimateSentimentAnalysis) => void;
  forceReload?: boolean;
  bordered?: boolean;
}

const ClimateSentimentAnalysisCard: React.FC<ClimateSentimentAnalysisCardProps> = ({ 
  onAnalysisGenerated, forceReload, bordered 
}) => {
  const [analysis, setAnalysis] = useState<ClimateSentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  // Buscar análise existente ao montar ou quando forceReload mudar
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        setIsLoading(true);
        const existing = await ClimateService.getExistingClimateSentimentAnalysis();
        setAnalysis(existing);
      } catch (error) {
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [forceReload]);

  const handleGenerateAnalysis = async () => {
    try {
      setIsLoading(true);
      const result = await ClimateService.generateClimateSentimentAnalysis();
      setAnalysis(result);
      
      if (onAnalysisGenerated) {
        onAnalysisGenerated(result);
      }
      
      showSuccessToast('Análise Gerada!', 'A análise de sentimento foi gerada com sucesso usando IA.');
    } catch (error: any) {
      console.error('Erro ao gerar análise de sentimento:', error);
      showErrorToast('Erro ao Gerar Análise', error.response?.data?.message || 'Não foi possível gerar a análise de sentimento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnalysis = async () => {
    if (!analysis) return;

    const textToCopy = `
ANÁLISE DE SENTIMENTO - CLIMA ORGANIZACIONAL
Ciclo: ${analysis.cycle}
Total de Avaliações: ${analysis.totalAssessments}
Score de Sentimento: ${analysis.overallSentimentScore}/100

ANÁLISE DE SENTIMENTO:
${analysis.sentimentAnalysis}

PONTOS FORTES:
${analysis.strengths}

ÁREAS DE PREOCUPAÇÃO:
${analysis.areasOfConcern}

DICAS PARA MELHORAR:
${analysis.improvementTips}

Gerado em: ${new Date(analysis.generatedAt).toLocaleString('pt-BR')}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      showSuccessToast('Análise Copiada!', 'A análise foi copiada para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      showErrorToast('Erro ao Copiar', 'Não foi possível copiar a análise. Tente novamente.');
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 70) return 'Positivo';
    if (score >= 40) return 'Neutro';
    return 'Crítico';
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-gray-200 p-4 sm:p-6`}>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
            <Brain className='w-5 h-5 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Análise de Sentimento</h3>
            <p className='text-sm text-gray-600'>IA analisa clima organizacional</p>
          </div>
        </div>

        {!analysis && !isLoading && (
          <button
            onClick={handleGenerateAnalysis}
            disabled={isLoading}
            className='flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Sparkles className='w-4 h-4' />
            <span className="hidden sm:inline">🚀 Iniciar Análise IA</span>
            <span className="sm:hidden">🚀 Análise IA</span>
          </button>
        )}

        {analysis && (
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
              <CheckCircle className='w-4 h-4' />
              <span className="hidden sm:inline">Já Gerado</span>
              <span className="sm:hidden">Gerado</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-8'>
          <div className='flex items-center gap-3'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
            <span className='text-gray-600 text-sm sm:text-base'>Gerando análise de sentimento...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!analysis && !isLoading && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <Clock className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
            <div className="min-w-0 flex-1">
              <h4 className='text-sm font-medium text-blue-900 mb-1'>⏳ Análise não gerada ainda</h4>
              <p className='text-sm text-blue-800 mb-3'>
                Clique em "🚀 Iniciar Análise IA" para criar uma análise inteligente do clima organizacional.
              </p>
              <div className='bg-white rounded-lg p-3 border border-blue-100'>
                <p className='text-sm text-blue-800'>
                  <strong>A IA analisará:</strong>
                </p>
                <ul className='text-sm text-blue-800 space-y-1 mt-2'>
                  <li>
                    • <strong>Sentimento geral</strong> das avaliações de clima
                  </li>
                  <li>
                    • <strong>Padrões</strong> nas notas e justificativas
                  </li>
                  <li>
                    • <strong>Pontos fortes</strong> e áreas de preocupação
                  </li>
                  <li>
                    • <strong>Dicas práticas</strong> para melhorar o clima
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className='space-y-4'>
          {/* Header Info */}
          <div className='bg-white rounded-lg p-4 border border-blue-100'>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center'>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${getSentimentColor(analysis.overallSentimentScore)}`}>
                  {analysis.overallSentimentScore}
                </div>
                <div className='text-xs text-gray-600'>Score Sentimento</div>
              </div>
              <div>
                <div className='text-xl sm:text-2xl font-bold text-green-600'>{analysis.totalAssessments}</div>
                <div className='text-xs text-gray-600'>Total Avaliações</div>
              </div>
              <div>
                <div className='text-xl sm:text-2xl font-bold text-purple-600'>{analysis.cycle}</div>
                <div className='text-xs text-gray-600'>Ciclo</div>
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${getSentimentColor(analysis.overallSentimentScore)}`}>
                  {getSentimentLabel(analysis.overallSentimentScore)}
                </div>
                <div className='text-xs text-gray-600'>Clima</div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className='bg-white rounded-lg p-4 border border-blue-100'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3'>
              <h4 className='text-md font-semibold text-gray-900 flex items-center gap-2'>
                <Brain className='w-4 h-4 text-blue-600' />
                <span className="hidden sm:inline">Análise da Inteligência Artificial</span>
                <span className="sm:hidden">Análise IA</span>
              </h4>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleCopyAnalysis}
                  className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Copiar análise'
                >
                  <Copy className='w-4 h-4' />
                </button>
              </div>
            </div>

            <div className='prose prose-sm max-w-none'>
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-400'>
                <div className='space-y-4'>
                  {/* Análise de Sentimento */}
                  <div>
                    <h5 className='font-semibold text-blue-800 mb-2'>📊 Análise de Sentimento</h5>
                    <div className="text-sm text-blue-700">
                      <MarkdownRenderer content={analysis.sentimentAnalysis} />
                    </div>
                  </div>

                  {/* Pontos Fortes */}
                  <div>
                    <h5 className='font-semibold text-green-800 mb-2'>✅ Pontos Fortes</h5>
                    <div className="text-sm text-green-700">
                      <MarkdownRenderer content={analysis.strengths} />
                    </div>
                  </div>

                  {/* Áreas de Preocupação */}
                  <div>
                    <h5 className='font-semibold text-orange-800 mb-2'>⚠️ Áreas de Preocupação</h5>
                    <div className="text-sm text-orange-700">
                      <MarkdownRenderer content={analysis.areasOfConcern} />
                    </div>
                  </div>

                  {/* Dicas de Melhoria */}
                  <div>
                    <h5 className='font-semibold text-purple-800 mb-2'>💡 Dicas para Melhorar</h5>
                    <div className="text-sm text-purple-700">
                      <MarkdownRenderer content={analysis.improvementTips} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateSentimentAnalysisCard; 