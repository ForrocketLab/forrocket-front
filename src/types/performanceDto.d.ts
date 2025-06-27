interface PillarScores {
  BEHAVIOR: number | null;
  EXECUTION: number | null;
  MANAGEMENT: number | null;
}

interface PerformanceDataDto {
  cycle: string;
  selfScore: PillarScores;
  managerScore: PillarScores;
  finalScore: number | null;
}

interface PerformanceHistoryDto {
  performanceData: PerformanceDataDto[];
  assessmentsSubmittedCount: number;
}
