import type { BrutalFactsMetricsDto, TeamAnalysisDto, TeamHistoricalPerformanceDto } from '../types/brutalFacts';

/**
 * Converte dados para CSV
 */
export function convertToCSV(data: unknown[], headers: string[]): string {
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          let value = (row as Record<string, unknown>)[header];
          // Tratar valores nulos e strings com vírgulas
          if (value === null || value === undefined) {
            value = '';
          } else if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(','),
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Faz download de arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados do Brutal Facts para CSV
 */
export function exportBrutalFactsToCSV(data: BrutalFactsMetricsDto): void {
  // Dados gerais
  const generalData = [
    {
      cycle: data.cycle,
      overallScoreAverage: data.overallScoreAverage,
      performanceImprovement: data.performanceImprovement,
      collaboratorsEvaluatedCount: data.collaboratorsEvaluatedCount,
      selfAssessmentTeamAverage: data.teamPerformance.selfAssessmentTeamAverage,
      managerAssessmentTeamAverage: data.teamPerformance.managerAssessmentTeamAverage,
      finalScoreTeamAverage: data.teamPerformance.finalScoreTeamAverage,
    },
  ];

  const generalHeaders = [
    'cycle',
    'overallScoreAverage',
    'performanceImprovement',
    'collaboratorsEvaluatedCount',
    'selfAssessmentTeamAverage',
    'managerAssessmentTeamAverage',
    'finalScoreTeamAverage',
  ];

  // Dados dos colaboradores
  const collaboratorHeaders = [
    'collaboratorName',
    'jobTitle',
    'seniority',
    'selfAssessmentAverage',
    'assessment360Average',
    'managerAssessmentAverage',
    'finalScore',
  ];

  // Combinar dados gerais e dos colaboradores
  const csvContent = [
    '# Dados Gerais da Equipe',
    convertToCSV(generalData, generalHeaders),
    '',
    '# Dados dos Colaboradores',
    convertToCSV(data.collaboratorsMetrics, collaboratorHeaders),
  ].join('\n');

  downloadFile(csvContent, `brutal-facts-${data.cycle}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta dados do Team Analysis para CSV (combinado com dados históricos do mesmo ciclo)
 */
export function exportTeamAnalysisToCSV(data: TeamAnalysisDto, historicalData?: TeamHistoricalPerformanceDto): void {
  // Encontra dados históricos do mesmo ciclo
  const historicalCycleData = historicalData?.performanceByCycle.find(cycle => cycle.cycle === data.cycle);

  const analysisData = [
    {
      // Dados do Team Analysis (sem managerId)

      cycle: data.cycle,
      totalCollaborators: data.totalCollaborators,
      teamAverageScore: data.teamAverageScore,
      highPerformers: data.highPerformers,
      lowPerformers: data.lowPerformers,
      behaviorAverage: data.behaviorAverage,
      executionAverage: data.executionAverage,
      criticalPerformers: data.criticalPerformers,
      createdAt: data.createdAt,
      scoreAnalysisSummary: data.scoreAnalysisSummary,
      feedbackAnalysisSummary: data.feedbackAnalysisSummary,
      // Dados históricos do mesmo ciclo (se disponível)
      ...(historicalCycleData && {
        averageOverallScore: historicalCycleData.averageOverallScore,
        averageSelfAssessment: historicalCycleData.averageSelfAssessment,
        averageReceived360: historicalCycleData.averageReceived360,
        historicalTotalCollaborators: historicalCycleData.totalCollaborators,
      }),
    },
  ];

  const headers = [
    // Colunas do Team Analysis

    'cycle',
    'totalCollaborators',
    'teamAverageScore',
    'highPerformers',
    'lowPerformers',
    'behaviorAverage',
    'executionAverage',
    'criticalPerformers',
    'createdAt',
    'scoreAnalysisSummary',
    'feedbackAnalysisSummary',
    // Colunas do Historical Performance (se disponível)
    ...(historicalCycleData
      ? ['averageOverallScore', 'averageSelfAssessment', 'averageReceived360', 'historicalTotalCollaborators']
      : []),
  ];

  const csvContent = convertToCSV(analysisData, headers);
  downloadFile(csvContent, `team-analysis-${data.cycle}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta dados do Historical Performance para CSV
 */
export function exportHistoricalPerformanceToCSV(data: TeamHistoricalPerformanceDto): void {
  // Apenas dados por ciclo - ciclos como linhas, notas como colunas
  const cycleHeaders = [
    'cycle',
    'averageOverallScore',
    'averageSelfAssessment',
    'averageReceived360',
    'totalCollaborators',
  ];

  const csvContent = convertToCSV(data.performanceByCycle, cycleHeaders);
  downloadFile(csvContent, 'team-historical-performance.csv', 'text/csv;charset=utf-8;');
}

/**
 * Exporta dados para JSON
 */
export function exportToJSON(data: unknown, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * Exporta dados do Brutal Facts para JSON
 */
export function exportBrutalFactsToJSON(data: BrutalFactsMetricsDto): void {
  exportToJSON(data, `brutal-facts-${data.cycle}.json`);
}

/**
 * Exporta dados do Team Analysis para JSON
 */
export function exportTeamAnalysisToJSON(data: TeamAnalysisDto): void {
  exportToJSON(data, `team-analysis-${data.cycle}.json`);
}

/**
 * Exporta dados do Historical Performance para JSON
 */
export function exportHistoricalPerformanceToJSON(data: TeamHistoricalPerformanceDto): void {
  exportToJSON(data, 'team-historical-performance.json');
}
