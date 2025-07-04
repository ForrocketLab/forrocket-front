import api from '../api';
import { type AxiosError } from 'axios';

const UPLOAD_ENDPOINT = '/import/historical-data';
const HISTORY_ENDPOINT = '/import/history';

/**
 * Envia os arquivos para o back-end para serem processados.
 */
const importHistoricalData = async (files: File[]): Promise<ImportHistory> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await api.post<ImportHistory>(UPLOAD_ENDPOINT, formData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error.response?.data?.message || 'Erro no servidor durante a importação.');
    }
};

/**
 * Busca o histórico de todas as importações.
 */
const getImportHistory = async (): Promise<ImportHistory[]> => {
    try {
        const response = await api.get<ImportHistory[]>(HISTORY_ENDPOINT);
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error.response?.data?.message || 'Falha ao carregar o histórico.');
      }
};

/**
 * Busca os detalhes de um histórico de importação específico.
 */
const getImportHistoryDetails = async (historyId: string): Promise<ImportHistoryDetails> => {
  try {
    const response = await api.get<ImportHistoryDetails>(`${HISTORY_ENDPOINT}/${historyId}`);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    throw new Error(error.response?.data?.message || 'Falha ao carregar os detalhes da importação.');
  }
};

/**
 * Deleta um registro de histórico de importação pelo ID.
 * @param historyId O ID do histórico a ser deletado.
 */
const deleteImportHistory = async (historyId: string): Promise<void> => {
  try {
    await api.delete(`${HISTORY_ENDPOINT}/${historyId}`);
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    console.error(`Erro ao deletar o histórico ${historyId}:`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Falha ao deletar o histórico de importação.');
    } else {
      throw new Error('Erro de conexão ao deletar. Verifique o servidor.');
    }
  }
};


const ImportService = {
  importHistoricalData,
  getImportHistory,
  getImportHistoryDetails,
  deleteImportHistory,
};

export default ImportService;