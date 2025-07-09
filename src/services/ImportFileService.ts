import { AxiosError } from 'axios';
import api from '../api';
import AuthService from './AuthService';

class ImportFileService {
  /**
   * Envia um arquivo Excel para processamento no backend
   * @param file Arquivo Excel a ser processado
   * @returns Resposta do servidor com mensagem de status
   */
  static async uploadExcelFile(file: File): Promise<ImportFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ImportFileResponse>('/import/historical-data', formData, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo Excel:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao processar o arquivo Excel.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Envia múltiplos arquivos Excel para processamento no backend
   * @param files Array de arquivos Excel a serem processados
   * @returns Resposta do servidor com detalhes de processamento em lote
   */
  static async uploadMultipleExcelFiles(files: File[]): Promise<ImportBulkResponse> {
    try {
      const formData = new FormData();

      // Adiciona todos os arquivos no campo 'files'
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post<ImportBulkResponse>('/import/historical-data/bulk', formData, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos Excel:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao processar os arquivos Excel.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca o histórico de lotes de importação do usuário
   * @returns Array de lotes de importação
   */
  static async getImportBatches(): Promise<ImportBatch[]> {
    try {
      const response = await api.get<ImportBatch[]>('/import/batches/my', {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de importações:', error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar histórico de importações.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Deleta um lote de importação específico
   * @param batchId ID do lote a ser deletado
   * @returns Resposta de confirmação
   */
  static async deleteBatch(batchId: string): Promise<DeleteBatchResponse> {
    try {
      const response = await api.delete<DeleteBatchResponse>(`/import/batches/${batchId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar lote ${batchId}:`, error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao deletar lote de importação.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }
}

export default ImportFileService;
