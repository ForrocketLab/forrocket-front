/**
 * Interface para a resposta do upload de arquivo único.
 */
export interface ImportFileResponse {
  message: string;
  userId: string;
  userName: string;
  batchId: string;
}

/**
 * Interface para arquivo individual na resposta bulk
 */
export interface FileResult {
  fileName: string;
  batchId: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  userId: string;
  userName: string;
}

/**
 * Interface para a resposta do upload de múltiplos arquivos.
 */
export interface ImportBulkResponse {
  message: string;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  fileResults: FileResult[];
}

/**
 * Interface para usuário que fez upload
 */
export interface UploadedUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Interface para contadores de registros criados
 */
export interface ImportCounts {
  createdUsers: number;
  createdSelfAssessments: number;
  createdAssessments360: number;
  createdReferenceFeedbacks: number;
}

/**
 * Interface para lote de importação (nova API)
 */
export interface ImportBatch {
  id: string;
  fileName: string;
  status: 'SUCCESS' | 'PROCESSING' | 'ERROR' | 'COMPLETED'; // Suporte para ambos os formatos
  importedAt: string;
  notes?: string | null; // Campo opcional
  uploadedUserId?: string; // Campo opcional
  uploadedUser: UploadedUser;
  _count: ImportCounts;
}

/**
 * Interface para resposta de deleção de lote
 */
export interface DeleteBatchResponse {
  message: string;
}

/**
 * Interface para parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'importedAt' | 'fileName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface para metadados de paginação
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Interface para resposta paginada de lotes
 */
export interface PaginatedImportBatchesResponse {
  data: ImportBatch[];
  meta: PaginationMeta;
}

/**
 * Interface para histórico de importação
 */
export interface ImportHistory {
  id: string;
  fileName: string;
  status: 'SUCCESS' | 'PROCESSING' | 'ERROR' | 'COMPLETED';
  importedAt: string;
  notes?: string | null;
  uploadedUserId?: string;
  uploadedUser: UploadedUser;
  _count: ImportCounts;
}

/**
 * Interface para detalhes do histórico de importação
 */
export interface ImportHistoryDetails {
  id: string;
  fileName: string;
  status: 'SUCCESS' | 'PROCESSING' | 'ERROR' | 'COMPLETED';
  importedAt: string;
  notes?: string | null;
  uploadedUserId?: string;
  uploadedUser: UploadedUser;
  _count: ImportCounts;
  detailedCounts: {
    usersCreated: number;
    selfAssessmentsCreated: number;
    assessments360Created: number;
    referenceFeedbacksCreated: number;
  };
}
