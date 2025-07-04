// Enums
export enum OKRStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ObjectiveStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum KeyResultStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum KeyResultType {
  PERCENTAGE = 'PERCENTAGE'
}

// DTOs de criação
export interface CreateOKRDto {
  title: string;
  description?: string;
  quarter: string;
  year: number;
  objectives?: CreateObjectiveDto[];
}

export interface CreateObjectiveDto {
  title: string;
  description?: string;
  keyResults?: CreateKeyResultDto[];
}

export interface CreateKeyResultDto {
  title: string;
  description?: string;
  type: KeyResultType;
  targetValue: number;
  currentValue?: number;
  unit?: string;
}

// DTOs de atualização
export interface UpdateOKRDto {
  title?: string;
  description?: string;
  quarter?: string;
  year?: number;
  status?: OKRStatus;
}

export interface UpdateObjectiveDto {
  title?: string;
  description?: string;
  status?: ObjectiveStatus;
  progress?: number;
}

export interface UpdateKeyResultDto {
  title?: string;
  description?: string;
  type?: KeyResultType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status?: KeyResultStatus;
}

// DTOs de resposta
export interface KeyResultResponse {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  type: KeyResultType;
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: KeyResultStatus;
  progress: number;
  formattedCurrentValue: string;
  formattedTargetValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveResponse {
  id: string;
  okrId: string;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  keyResults?: KeyResultResponse[];
}

export interface OKRResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  quarter: string;
  year: number;
  status: OKRStatus;
  overallProgress: number;
  createdAt: string;
  updatedAt: string;
  objectives?: ObjectiveResponse[];
}

export interface OKRSummary {
  id: string;
  title: string;
  quarter: string;
  year: number;
  status: OKRStatus;
  overallProgress: number;
  objectivesCount: number;
  completedObjectives: number;
  updatedAt: string;
}

// Utilitários de interface
export interface OKRFormData {
  title: string;
  description: string;
  quarter: string;
  year: number;
}

export interface ObjectiveFormData {
  title: string;
  description: string;
}

export interface KeyResultFormData {
  title: string;
  description: string;
  type: KeyResultType;
  targetValue: number;
  unit: string;
}

// Helpers para exibição
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'ACTIVE': 'Ativo',
    'PAUSED': 'Pausado',
    'COMPLETED': 'Concluído',
    'CANCELLED': 'Cancelado',
    'NOT_STARTED': 'Não Iniciado',
    'IN_PROGRESS': 'Em Progresso'
  };
  
  return statusLabels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'ACTIVE': 'bg-teal-100 text-teal-800',
    'PAUSED': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'IN_PROGRESS': 'bg-teal-100 text-teal-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-teal-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getQuarterOptions = (): Array<{ value: string; label: string }> => {
  // Só permitir criar OKRs a partir do Q3 2025 (final do Q2 2025)
  return [
    { value: '2025-Q3', label: 'Q3 2025' },
    { value: '2025-Q4', label: 'Q4 2025' },
    { value: '2026-Q1', label: 'Q1 2026' },
    { value: '2026-Q2', label: 'Q2 2026' },
    { value: '2026-Q3', label: 'Q3 2026' },
    { value: '2026-Q4', label: 'Q4 2026' },
    { value: '2027-Q1', label: 'Q1 2027' },
    { value: '2027-Q2', label: 'Q2 2027' }
  ];
};

export const getKeyResultTypeOptions = (): Array<{ value: KeyResultType; label: string }> => {
  return [
    { value: KeyResultType.PERCENTAGE, label: 'Porcentagem' }
  ];
};

// Funções específicas para KeyResult
export const getKeyResultStatusLabel = (status: KeyResultStatus): string => {
  return getStatusLabel(status);
};

export const getKeyResultStatusColor = (status: KeyResultStatus): string => {
  return getStatusColor(status);
};

export const formatKeyResultDisplay = (keyResult: KeyResultResponse): string => {
  const { progress } = keyResult;
  
  // Sempre mostrar apenas como progresso percentual
  return `${Math.round(progress)}% de 100%`;
};

// Funções específicas para Objective
export const getObjectiveStatusLabel = (status: ObjectiveStatus): string => {
  return getStatusLabel(status);
};

export const getObjectiveStatusColor = (status: ObjectiveStatus): string => {
  return getStatusColor(status);
}; 