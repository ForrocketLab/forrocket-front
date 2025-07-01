import { type FC, useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { type AxiosError } from 'axios';
import { UploadCloud, Trash2 } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import api from '../../api';

interface UploadResponse {
  fileName: string;
  status: 'success' | 'error';
  message?: string;
}

interface UploadedFileResult {
  name: string;
  size: number;
}

const HRImport: FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFileResults, setUploadedFileResults] = useState<UploadedFileResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      showErrorToast('Arquivo(s) Rejeitado(s)', `Apenas arquivos .xlsx e .csv são permitidos.`);
    }
    setFiles(prev => [...prev, ...acceptedFiles.filter(newFile => !prev.some(f => f.name === newFile.name))]);
  }, [showErrorToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
  });

  const removeFileToUpload = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const removeFileFromResult = (fileName: string) => {
    setUploadedFileResults(prev => prev.filter(file => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showErrorToast("Nenhum arquivo", "Por favor, selecione ao menos um arquivo para importar.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    const currentFilesToUpload = [...files];
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.post<UploadResponse[]>('/import/historical-data', formData);
      
      setUploadedFileResults(prevResults => [
        ...prevResults,
        ...currentFilesToUpload.map(file => ({ name: file.name, size: file.size }))
      ]);

      showSuccessToast('Importação Concluída', `${currentFilesToUpload.length} arquivo(s) foram processados.`);
      setFiles([]);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Ocorreu um erro no servidor.';
      showErrorToast('Erro na Importação', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Importar Histórico</h1>
        <p className="text-gray-600 mt-1">
          Importe os históricos dos colaboradores para o sistema. A importação de um arquivo XLSX com múltiplas planilhas processará cada uma em ordem.
        </p>

        {/* --- ÁREA DE UPLOAD --- */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200
                ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-gray-500">
                <UploadCloud className="w-12 h-12 mb-4 text-gray-400"/>
                <p className="font-semibold text-gray-700">Clique para selecionar ou arraste os arquivos aqui</p>
                <p className="text-sm">Formatos suportados: .xlsx ou .csv</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="px-6 pb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Arquivos Selecionados</h2>
              <ul className="border border-gray-200 rounded-lg overflow-hidden">
                <li className="flex justify-between items-center p-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <span className="w-3/5">Nome do arquivo</span>
                  <span className="w-1/5 text-right">Tamanho</span>
                  <span className="w-1/5 text-right">Ações</span>
                </li>
                {files.map(file => (
                  <li key={file.name} className="flex justify-between items-center p-3 border-t border-gray-200">
                    <span className="w-3/5 text-gray-800 font-medium truncate" title={file.name}>{file.name}</span>
                    <span className="w-1/5 text-right text-gray-600">{formatBytes(file.size)}</span>
                    <div className="w-1/5 flex justify-end">
                      <button onClick={() => removeFileToUpload(file.name)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Importando...' : `Importar ${files.length} Arquivo(s)`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- ÁREA DE RESULTADOS --- */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resultados da Importação</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li className="flex justify-between items-center px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <span className="w-3/5">Nome do arquivo</span>
                <span className="w-1/5 text-right">Tamanho</span>
                <span className="w-1/5 text-right">Ações</span>
              </li>
              {uploadedFileResults.length === 0 ? (
                 <li className="text-center text-gray-500 p-6">Nenhum arquivo importado ainda.</li>
              ) : (
                uploadedFileResults.map(fileResult => (
                  <li key={fileResult.name} className="flex justify-between items-center px-4 py-3">
                    <span className="w-3/5 text-gray-800 font-medium truncate" title={fileResult.name}>{fileResult.name}</span>
                    <span className="w-1/5 text-right text-gray-600">{formatBytes(fileResult.size)}</span>
                    <div className="w-1/5 flex justify-end">
                      <button onClick={() => removeFileFromResult(fileResult.name)} className="text-gray-400 hover:text-red-500 p-1 rounded-full">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRImport;