import api from '../api';
import { type AxiosError } from 'axios';
import { type UploadResult, type UploadedFile } from '../types/import'; 

const UPLOAD_ENDPOINT = '/import/historical-data';
const FILES_ENDPOINT = '/history'; 

/**
 * Envia os arquivos para o back-end para serem processados e importados.
 * @param files - Um array de objetos File a serem enviados.
 * @returns Uma promessa que resolve para um array de resultados de upload.
 */
const importHistoricalData = async (files: File[]): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file); // O back-end espera um campo chamado 'files'
  });

  try {
    const response = await api.post<UploadResult[]>(UPLOAD_ENDPOINT, formData);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    if (error.response) {
      throw new Error(error.response.data?.message || 'Ocorreu um erro no servidor durante a importação.');
    } else if (error.request) {
      throw new Error('Erro de conexão. Verifique se o backend está rodando e o proxy está configurado corretamente.');
    } else {
      throw new Error('Ocorreu um erro inesperado ao preparar a requisição.');
    }
  }
};

/**
 * Busca a lista de arquivos históricos já importados do backend.
 * @returns Uma promessa que resolve para um array de arquivos importados.
 */
const getUploadedFiles = async (): Promise<UploadedFile[]> => {
  try {
    const response = await api.get<UploadedFile[]>(FILES_ENDPOINT);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    console.error('Erro ao buscar arquivos importados:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Falha ao carregar a lista de arquivos.');
    } else {
      throw new Error('Erro de conexão ao buscar arquivos. Verifique o servidor.');
    }
  }
};

/**
 * Deleta um arquivo histórico do backend.
 * @param fileName - O nome do arquivo a ser deletado.
 */
const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await api.delete(`${FILES_ENDPOINT}/${fileName}`);
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    console.error(`Erro ao deletar arquivo "${fileName}":`, error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Falha ao deletar o arquivo.');
    } else {
      throw new Error('Erro de conexão ao deletar arquivo. Verifique o servidor.');
    }
  }
};

const ImportService = {
  importHistoricalData,
  getUploadedFiles,
  deleteFile,
};

export default ImportService;