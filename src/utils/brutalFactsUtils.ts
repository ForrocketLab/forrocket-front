import type {
  BrutalFactsMetricsDto,
  TeamAnalysisDto,
  ProcessedCollaboratorData,
  CollaboratorMetricDto,
  PerformanceData,
} from '../types/brutalFacts';

/**
 * Gera iniciais do nome completo
 */
export function generateInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(name => name.length > 0)
    .slice(0, 2)
    .map(name => name[0].toUpperCase())
    .join('');
}

/**
 * Determina a cor da nota final baseada no valor
 */
export function getFinalScoreColor(score: number | null): 'green' | 'teal' | 'yellow' {
  if (!score) return 'yellow';

  if (score >= 4.5) return 'green';
  if (score >= 3.5) return 'teal';
  return 'yellow';
}

/**
 * Determina o status do colaborador baseado na nota final
 */
export function getCollaboratorStatus(score: number | null): string {
  if (!score) return 'medium';

  if (score >= 4.0) return 'high';
  if (score >= 3.5) return 'medium';
  return 'low';
}

/**
 * Converte dados de colaborador da API para formato usado nos componentes
 */
export function transformCollaboratorData(collaborator: CollaboratorMetricDto): ProcessedCollaboratorData {
  const finalScore = collaborator.finalScore;

  return {
    id: collaborator.collaboratorId,
    initials: generateInitials(collaborator.collaboratorName),
    name: collaborator.collaboratorName,
    jobTitle: collaborator.jobTitle,
    selfAssessmentScore: collaborator.selfAssessmentAverage,
    evaluation360Score: collaborator.assessment360Average,
    managerScore: collaborator.managerAssessmentAverage,
    finalScore: finalScore,
    finalScoreColor: getFinalScoreColor(finalScore),
    status: getCollaboratorStatus(finalScore),
    seniority: collaborator.seniority,
  };
}

/**
 * Processa dados de métricas para usar nos cards de resumo
 */
export function processMetricsForCards(metrics: BrutalFactsMetricsDto) {
  return {
    overallScoreAverage: metrics.overallScoreAverage,
    collaboratorsEvaluatedCount: metrics.collaboratorsEvaluatedCount,
    performanceImprovement: metrics.performanceImprovement,
    teamPerformance: metrics.teamPerformance,
    cycle: metrics.cycle,
  };
}

/**
 * Gera texto de insights baseado na análise da equipe
 */
export function generateInsightsText(teamAnalysis: TeamAnalysisDto): string {
  const { highPerformers, criticalPerformers, totalCollaborators, behaviorAverage, executionAverage } = teamAnalysis;

  let insights = `A equipe de ${totalCollaborators} colaboradores apresenta `;

  if (highPerformers > 0) {
    insights += `${highPerformers} colaborador${highPerformers > 1 ? 'es' : ''} de alto desempenho `;
  }

  if (criticalPerformers > 0) {
    insights += `e ${criticalPerformers} em situação crítica. `;
  } else {
    insights += 'e nenhum em situação crítica. ';
  }

  insights += `O pilar Comportamento (${behaviorAverage.toFixed(1)}) `;

  if (behaviorAverage > executionAverage) {
    insights += `supera Execução (${executionAverage.toFixed(1)}), indicando oportunidade de melhoria em resultados práticos.`;
  } else if (executionAverage > behaviorAverage) {
    insights += `pode ser aprimorado comparado à Execução (${executionAverage.toFixed(1)}).`;
  } else {
    insights += `está equilibrado com Execução (${executionAverage.toFixed(1)}).`;
  }

  return insights;
}

/**
 * Combina análises de score e feedback em um texto unificado para o resumo
 */
export function generateCombinedSummaryText(teamAnalysis: TeamAnalysisDto): string {
  const { scoreAnalysisSummary, feedbackAnalysisSummary } = teamAnalysis;

  // Retorna primeiro o resumo da análise de score, que é mais conciso
  return scoreAnalysisSummary || feedbackAnalysisSummary || 'Análise não disponível.';
}

/**
 * Gera dados históricos de performance simulados baseados nos dados atuais
 * Esta função deve ser substituída quando dados históricos reais estiverem disponíveis
 */
export function generateHistoricalPerformanceData(currentMetrics: BrutalFactsMetricsDto): PerformanceData[] {
  const currentScore = currentMetrics.overallScoreAverage;
  const currentSelfScore = currentMetrics.teamPerformance.selfAssessmentTeamAverage;
  const currentManagerScore = currentMetrics.teamPerformance.managerAssessmentTeamAverage;

  // Simula evolução histórica com base nos dados atuais
  const historicalData: PerformanceData[] = [
    {
      cycle: '2023.1',
      finalScore: Math.max(1.0, currentScore ?? 0.6 - 0.6),
      selfScore: Math.max(1.0, currentSelfScore - 0.7),
      managerScore: Math.max(1.0, currentManagerScore - 0.5),
    },
    {
      cycle: '2023.2',
      finalScore: Math.max(1.0, currentScore ?? 0.3 - 0.3),
      selfScore: Math.max(1.0, currentSelfScore - 0.4),
      managerScore: Math.max(1.0, currentManagerScore - 0.2),
    },
    {
      cycle: '2024.1',
      finalScore: Math.max(1.0, currentScore ?? 0.6 - 0.1),
      selfScore: Math.max(1.0, currentSelfScore - 0.2),
      managerScore: Math.max(1.0, currentManagerScore - 0.1),
    },
    {
      cycle: currentMetrics.cycle,
      finalScore: currentScore,
      selfScore: currentSelfScore,
      managerScore: currentManagerScore,
    },
  ];

  return historicalData;
}
