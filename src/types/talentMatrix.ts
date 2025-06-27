export interface TalentMatrixPosition {
  id: string;
  name: string;
  jobTitle: string;
  businessUnit: string;
  seniority: string;
  performanceScore: number;
  potentialScore: number;
  matrixPosition: number;
  matrixLabel: string;
  matrixColor: string;
  initials: string;
  evaluationDetails?: {
    selfAssessmentScore?: number;
    managerAssessmentScore?: number;
    assessment360Score?: number;
    committeeScore?: number;
    totalEvaluations: number;
  };
}

export interface TalentMatrixStats {
  totalCollaborators: number;
  categoryDistribution: Record<string, number>;
  businessUnitDistribution: Record<string, number>;
  topTalents: number;
  lowPerformers: number;
}

export interface TalentMatrixData {
  cycle: string;
  positions: TalentMatrixPosition[];
  stats: TalentMatrixStats;
  generatedAt: string;
  hasInsufficientData?: boolean;
  message?: string;
}

export interface MatrixCell {
  id: number;
  label: string;
  color: string;
  performance: 'low' | 'medium' | 'high';
  potential: 'low' | 'medium' | 'high';
  x: number;
  y: number;
}

export const MATRIX_CELLS: MatrixCell[] = [
  { id: 1, label: 'Estrelas', color: '#22c55e', performance: 'high', potential: 'high', x: 2, y: 2 },
  { id: 2, label: 'Talentos', color: '#84cc16', performance: 'high', potential: 'medium', x: 2, y: 1 },
  { id: 3, label: 'Questionáveis', color: '#eab308', performance: 'high', potential: 'low', x: 2, y: 0 },
  { id: 4, label: 'Especialistas', color: '#3b82f6', performance: 'medium', potential: 'high', x: 1, y: 2 },
  { id: 5, label: 'Consistentes', color: '#6b7280', performance: 'medium', potential: 'medium', x: 1, y: 1 },
  { id: 6, label: 'Trabalhadores', color: '#f59e0b', performance: 'medium', potential: 'low', x: 1, y: 0 },
  { id: 7, label: 'Potenciais', color: '#8b5cf6', performance: 'low', potential: 'high', x: 0, y: 2 },
  { id: 8, label: 'Inconsistentes', color: '#ef4444', performance: 'low', potential: 'medium', x: 0, y: 1 },
  { id: 9, label: 'Baixo Desempenho', color: '#dc2626', performance: 'low', potential: 'low', x: 0, y: 0 }
]; 