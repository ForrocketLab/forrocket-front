import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, BarChart3, Calendar, Award, Target } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ProgressBar from '../ProgressBar';
import useHistoricalEvolution from '../../hooks/useHistoricalEvolution';
import type { 
  CollaboratorDetailedEvolution,
  CriterionEvolution 
} from '../../types/evaluations';

interface CollaboratorEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboratorId: string;
  collaboratorName: string;
}

const CollaboratorEvolutionModal: React.FC<CollaboratorEvolutionModalProps> = ({
  isOpen,
  onClose,
  collaboratorId,
  collaboratorName,
}) => {
  const [details, setDetails] = useState<CollaboratorDetailedEvolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCollaboratorDetails } = useHistoricalEvolution();

  useEffect(() => {
    if (isOpen && collaboratorId) {
      loadCollaboratorDetails();
    }
  }, [isOpen, collaboratorId]);

  const loadCollaboratorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollaboratorDetails(collaboratorId);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
      console.error('Erro ao carregar detalhes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'BEHAVIOR':
        return 'bg-blue-600';
      case 'EXECUTION':
        return 'bg-green-600';
      case 'MANAGEMENT':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPillarName = (pillar: string) => {
    switch (pillar) {
      case 'BEHAVIOR':
        return 'Comportamento';
      case 'EXECUTION':
        return 'Execução';
      case 'MANAGEMENT':
        return 'Gestão';
      default:
        return pillar;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Evolução Histórica - {collaboratorName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {details && !loading && (
            <div className="space-y-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Ciclos</p>
                      <p className="text-lg font-semibold">{details.summary.totalCycles}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Média Geral</p>
                      <p className="text-lg font-semibold">{details.summary.historicalAverage?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Melhor Nota</p>
                      <p className="text-lg font-semibold">{details.summary.bestScore?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    {getTrendIcon(details.summary.overallTrend)}
                    <div className="ml-2">
                      <p className="text-sm text-gray-600">Tendência</p>
                      <p className="text-lg font-semibold">
                        {details.summary.overallTrend}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolução por Pilares */}
              {details.pillarEvolution && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução por Pilares</h3>
                  <div className="space-y-4">
                    {details.pillarEvolution.map((pillar, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{getPillarName(pillar.pillar)}</h4>
                          <div className="flex items-center">
                            {getTrendIcon(pillar.trend)}
                            <span className="ml-2 text-sm text-gray-600">
                              {pillar.trend.percentageChange > 0 ? '+' : ''}
                              {pillar.trend.percentageChange?.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Média: {pillar.average?.toFixed(2)}</span>
                          <ProgressBar 
                            percentage={(pillar.average || 0) * 20} // Convertendo para porcentagem (assumindo escala 0-5)
                            color={getPillarColor(pillar.pillar)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico de Ciclos */}
              {details.cycleDetails && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Ciclos</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ciclo
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Autoavaliação
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avaliação Gestor
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nota Final (Comitê)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {details.cycleDetails.map((cycle) => (
                          <tr key={cycle.cycle}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {cycle.cycle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-medium text-blue-600">
                                {cycle.selfAssessmentScore?.toFixed(2) || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-medium text-purple-600">
                                {cycle.managerAssessmentScore?.toFixed(2) || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-medium text-green-600">
                                {cycle.committeeAssessmentScore?.toFixed(2) || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Evolução por Critérios */}
              {details.criteriaEvolution && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução por Critérios</h3>
                  {Object.entries(
                    details.criteriaEvolution.reduce((acc: Record<string, CriterionEvolution[]>, criterion) => {
                      if (!acc[criterion.pillar]) {
                        acc[criterion.pillar] = [];
                      }
                      acc[criterion.pillar].push(criterion);
                      return acc;
                    }, {})
                  ).map(([pillar, criteria]) => (
                    <div key={pillar} className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">{getPillarName(pillar)}</h4>
                      <div className="space-y-4">
                        {criteria.map((criterion) => (
                          <div key={criterion.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">{criterion.description}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              {/* Autoavaliação */}
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm text-blue-700 font-medium">Autoavaliação</div>
                                <div className="text-lg font-bold text-blue-800">{criterion.selfAverage.toFixed(2)}</div>
                              </div>
                              {/* Avaliação Gestor */}
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-sm text-purple-700 font-medium">Gestor</div>
                                <div className="text-lg font-bold text-purple-800">{criterion.managerAverage.toFixed(2)}</div>
                              </div>
                              {/* Nota Final (Comitê) */}
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-sm text-green-700 font-medium">Comitê</div>
                                <div className="text-lg font-bold text-green-800">{criterion.committeeAverage.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights */}
              {details.insights && details.insights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
                  <div className="space-y-3">
                    {details.insights.map((insight, index) => (
                      <div key={index} className={`bg-${insight.type === 'strength' ? 'green' : 'red'}-50 border border-${insight.type === 'strength' ? 'green' : 'red'}-200 rounded-lg p-4`}>
                        <div className="flex items-start">
                          <div className={`w-2 h-2 bg-${insight.type === 'strength' ? 'green' : 'red'}-600 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                          <div>
                            <p className={`text-sm text-${insight.type === 'strength' ? 'green' : 'red'}-700 mt-1`}>{insight.description}</p>
                            {insight.supportingData && insight.supportingData.length > 0 && (
                              <ul className={`text-xs text-${insight.type === 'strength' ? 'green' : 'red'}-600 mt-2 list-disc list-inside`}>
                                {insight.supportingData.map((data: string, i: number) => (
                                  <li key={i}>{data}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorEvolutionModal;