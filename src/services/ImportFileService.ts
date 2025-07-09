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
   * Busca o histórico de lotes de importação do usuário com paginação
   * @param params Parâmetros de paginação e ordenação
   * @returns Resposta paginada com lotes de importação
   */
  static async getImportBatches(params?: PaginationParams): Promise<PaginatedImportBatchesResponse> {
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/import/batches/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await api.get<PaginatedImportBatchesResponse>(url, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de importações:', error);

      // Fallback para método legado se o backend ainda não suportar paginação
      if (error instanceof AxiosError && error.response?.status === 404) {
        console.warn('Endpoint paginado não encontrado, usando método legado...');
        try {
          const legacyData = await this.getImportBatchesLegacy();

          // Simular paginação no frontend
          const page = params?.page || 1;
          const limit = params?.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = legacyData.slice(startIndex, endIndex);

          return {
            data: paginatedData,
            meta: {
              page,
              limit,
              total: legacyData.length,
              totalPages: Math.ceil(legacyData.length / limit),
              hasNext: endIndex < legacyData.length,
              hasPrevious: page > 1,
            },
          };
        } catch {
          throw new Error('Falha ao buscar histórico de importações.');
        }
      }

      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || 'Falha ao buscar histórico de importações.');
      }
      throw new Error('Ocorreu um erro de rede. Tente novamente.');
    }
  }

  /**
   * Busca o histórico de lotes de importação (método legado para compatibilidade)
   * @deprecated Use getImportBatches com parâmetros de paginação
   * @returns Array de lotes de importação
   */
  static async getImportBatchesLegacy(): Promise<ImportBatch[]> {
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
