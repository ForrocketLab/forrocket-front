/**
 * Interface para a resposta do upload de arquivo único.
 */
interface ImportFileResponse {
  message: string;
  userId: string;
  userName: string;
  batchId: string;
}

/**
 * Interface para arquivo individual na resposta bulk
 */
interface FileResult {
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
interface ImportBulkResponse {
  message: string;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  fileResults: FileResult[];
}

/**
 * Interface para usuário que fez upload
 */
interface UploadedUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Interface para contadores de registros criados
 */
interface ImportCounts {
  createdUsers: number;
  createdSelfAssessments: number;
  createdAssessments360: number;
  createdReferenceFeedbacks: number;
}

/**
 * Interface para lote de importação (nova API)
 */
interface ImportBatch {
  id: string;
  fileName: string;
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR';
  importedAt: string;
  notes: string | null;
  uploadedUserId: string;
  uploadedUser: UploadedUser;
  _count: ImportCounts;
}

/**
 * Interface para resposta de deleção de lote
 */
interface DeleteBatchResponse {
  message: string;
}
