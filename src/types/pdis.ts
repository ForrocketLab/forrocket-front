// Enums
export enum PDIStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS', 
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum PDIActionStatus {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum PDIPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// DTOs de criação
export interface CreatePDIDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  actions: CreatePDIActionDto[];
}

export interface CreatePDIActionDto {
  title: string;
  description: string;
  deadline: string;
  priority?: PDIPriority;
}

// DTOs de atualização
export interface UpdatePDIDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: PDIStatus;
  actions?: UpdatePDIActionDto[];
}

export interface UpdatePDIActionDto {
  id?: string;
  title?: string;
  description?: string;
  deadline?: string;
  priority?: PDIPriority;
  status?: PDIActionStatus;
}

// DTOs de resposta
export interface PDIActionResponse {
  id: string;
  pdiId: string;
  title: string;
  description: string;
  deadline: string;
  priority: PDIPriority;
  status: PDIActionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PDIResponse {
  id: string;
  collaboratorId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: PDIStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  actions: PDIActionResponse[];
}

export interface PDISummary {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string; 
  status: PDIStatus;
  actionsCount: number;
  completedActions: number;
  progressPercentage: number;
  updatedAt: string;
}

// Helpers para exibição
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'NOT_STARTED': 'Não Iniciado',
    'IN_PROGRESS': 'Em Progresso',
    'COMPLETED': 'Concluído',
    'ARCHIVED': 'Arquivado',
    'TO_DO': 'A Fazer',
    'BLOCKED': 'Bloqueado'
  };
  
  return statusLabels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'IN_PROGRESS': 'bg-teal-100 text-teal-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'ARCHIVED': 'bg-red-100 text-red-800',
    'TO_DO': 'bg-gray-100 text-gray-800',
    'BLOCKED': 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityLabel = (priority: string): string => {
  const priorityLabels: Record<string, string> = {
    'LOW': 'Baixa',
    'MEDIUM': 'Média',
    'HIGH': 'Alta',
    'CRITICAL': 'Crítica'
  };
  
  return priorityLabels[priority] || priority;
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    'LOW': 'bg-blue-100 text-blue-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'CRITICAL': 'bg-red-100 text-red-800'
  };
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-teal-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getPriorityOptions = (): Array<{ value: PDIPriority; label: string }> => {
  return [
    { value: PDIPriority.LOW, label: 'Baixa' },
    { value: PDIPriority.MEDIUM, label: 'Média' },
    { value: PDIPriority.HIGH, label: 'Alta' },
    { value: PDIPriority.CRITICAL, label: 'Crítica' }
  ];
};

export const getStatusOptions = (): Array<{ value: PDIStatus; label: string }> => {
  return [
    { value: PDIStatus.NOT_STARTED, label: 'Não Iniciado' },
    { value: PDIStatus.IN_PROGRESS, label: 'Em Progresso' },
    { value: PDIStatus.COMPLETED, label: 'Concluído' },
    { value: PDIStatus.ARCHIVED, label: 'Arquivado' }
  ];
};

export const getActionStatusOptions = (): Array<{ value: PDIActionStatus; label: string }> => {
  return [
    { value: PDIActionStatus.TO_DO, label: 'A Fazer' },
    { value: PDIActionStatus.IN_PROGRESS, label: 'Em Progresso' },
    { value: PDIActionStatus.COMPLETED, label: 'Concluído' },
    { value: PDIActionStatus.BLOCKED, label: 'Bloqueado' }
  ];
};

// Funções utilitárias para deadline e atraso
/**
 * Verifica se um PDI está próximo do vencimento (últimos 7 dias)
 */
export const isPDINearDeadline = (pdi: PDISummary): boolean => {
  if (pdi.status === PDIStatus.COMPLETED || pdi.status === PDIStatus.ARCHIVED) {
    return false;
  }

  const endDate = new Date(pdi.endDate);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 7 && diffDays > 0;
};

/**
 * Verifica se um PDI está em atraso (passou da data de fim e não está concluído)
 */
export const isPDIOverdue = (pdi: PDISummary): boolean => {
  if (pdi.status === PDIStatus.COMPLETED || pdi.status === PDIStatus.ARCHIVED) {
    return false;
  }

  const endDate = new Date(pdi.endDate);
  const today = new Date();
  
  // Remove as horas para comparar apenas datas
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return endDate.getTime() < today.getTime();
};

/**
 * Calcula quantos dias um PDI está em atraso
 */
export const getPDIOverdueDays = (pdi: PDISummary): number => {
  if (!isPDIOverdue(pdi)) return 0;

  const endDate = new Date(pdi.endDate);
  const today = new Date();
  
  // Remove as horas para comparar apenas datas
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - endDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retorna a cor apropriada baseada no status de deadline do PDI
 */
export const getPDIDeadlineColor = (pdi: PDISummary): string => {
  if (isPDIOverdue(pdi)) {
    return 'text-red-600 bg-red-50 border-red-200';
  }
  if (isPDINearDeadline(pdi)) {
    return 'text-orange-600 bg-orange-50 border-orange-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

/**
 * Retorna o texto de status do deadline
 */
export const getPDIDeadlineStatus = (pdi: PDISummary): string => {
  if (isPDIOverdue(pdi)) {
    const days = getPDIOverdueDays(pdi);
    return `Atrasado há ${days} dia${days > 1 ? 's' : ''}`;
  }
  if (isPDINearDeadline(pdi)) {
    const endDate = new Date(pdi.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  }
  return '';
}; 