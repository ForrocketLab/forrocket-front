/**
 * Interface para descrever a estrutura do resultado de upload/processamento de cada arquivo.
 */
export interface UploadResult {
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
 */
export interface UploadedFile {
  fileName: string;
  size: number;
}