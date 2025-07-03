// DTOs para Brutal Facts
interface BrutalFactsMetricsDto {
  cycle: string;
  overallScoreAverage: number | null;
  performanceImprovement: number | null;
  collaboratorsEvaluatedCount: number;
  teamPerformance: {
    selfAssessmentTeamAverage: number;
    managerAssessmentTeamAverage: number;
    finalScoreTeamAverage: number | null;
  };
  collaboratorsMetrics: CollaboratorMetricDto[];
}

interface CollaboratorMetricDto {
  collaboratorId: string;
  collaboratorName: string;
  jobTitle: string;
  seniority: string;
  selfAssessmentAverage: number;
  assessment360Average: number;
  managerAssessmentAverage: number;
  finalScore: number | null;
}

// DTOs para Team Analysis
interface TeamAnalysisDto {
  id: string;
  managerId: string;
  cycle: string;
  scoreAnalysisSummary: string;
  feedbackAnalysisSummary: string;
  totalCollaborators: number;
  teamAverageScore: number;
  highPerformers: number;
  lowPerformers: number;
  behaviorAverage: number;
  executionAverage: number;
  criticalPerformers: number;
  createdAt: string;
}

// Tipos para uso interno dos componentes
export interface ProcessedCollaboratorData {
  id: string;
  initials: string;
  name: string;
  jobTitle: string;
  selfAssessmentScore: number | null;
  evaluation360Score: number | null;
  managerScore: number | null;
  finalScore: number | null;
  finalScoreColor: 'green' | 'teal' | 'yellow';
  status: string;
  seniority?: string;
}

export interface PerformanceData {
  cycle: string;
  finalScore: number | null;
  selfScore: number;
  managerScore: number;
}

// DTO para dados históricos de performance (se disponível no backend)
export interface HistoricalPerformanceDto {
  cycle: string;
  averageFinalScore: number;
  averageSelfScore: number;
  averageManagerScore: number;
}

// DTO para Performance Histórica da Equipe
export interface TeamHistoricalPerformanceDto {
  managerId: string;
  performanceByCycle: PerformanceCycleDto[];
  totalCycles: number;
}

export interface PerformanceCycleDto {
  cycle: string;
  averageOverallScore: number | null;
  averageSelfAssessment: number;
  averageReceived360: number;
  totalCollaborators: number;
}

// Tipos processados para o gráfico
export interface ProcessedPerformanceData {
  cycle: string;
  finalScore: number | null;
  selfScore: number;
  managerScore: number; // Será mapeado para averageReceived360
}
