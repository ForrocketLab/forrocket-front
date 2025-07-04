/**
 * Interface para descrever a estrutura do resultado de upload/processamento de cada arquivo.
 */
interface UploadResult {
  fileName: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  data?: {
    created: number;
    updated: number;
    errors?: Array<{ record: any; message: string }>;
  };
}

/**
 * Interface para representar um arquivo já importado (listado do backend).
 * Reflete o modelo `ImportHistory` do Prisma.
 */
interface ImportHistory {
  id: string;
  fileName: string;
  fileSize: number | null;
  uploadDate: string;
  uploadedByEmail: string | null;
  overallStatus: 'IN_PROGRESS' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'ERROR';
  totalSheetsProcessed: number;
  totalRecordsCreated: number;
  totalRecordsUpdated: number;
  totalErrors: number;
  details: any;
}

/**
 * Representa os dados detalhados de uma importação específica, incluindo os registros.
 */
interface ImportHistoryDetails extends ImportHistory {
  perfisImportados: any[];
  autoAvaliacoesImportadas: any[];
  avaliacoes360Importadas: any[];
  pesquisasReferenciaImportadas: any[];
}