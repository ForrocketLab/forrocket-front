import { type FC, useState, useCallback, useEffect } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { type AxiosError } from 'axios';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, XCircle, Loader, Eye, Trash2, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import ImportService from '../../services/ImportService';
import ImportDetailsModal from './components/ImportDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const HRImport: FC = () => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  const [selectedHistoryDetails, setSelectedHistoryDetails] = useState<ImportHistoryDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const [historyToDelete, setHistoryToDelete] = useState<ImportHistory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const historyData = await ImportService.getImportHistory();
        setImportHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar o histórico de importações.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      showErrorToast('Arquivo(s) Rejeitado(s)', `Apenas arquivos .xlsx e .xls são permitidos.`);
    }
    setFilesToUpload(acceptedFiles);
  }, [showErrorToast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      showErrorToast('Nenhum arquivo', 'Por favor, selecione um arquivo para importar.');
      return;
    }
    setIsUploading(true);
    try {
      const result = await ImportService.importHistoricalData(filesToUpload);
      showSuccessToast('Sucesso', `Arquivo "${result.fileName}" enviado para processamento.`);
      setFilesToUpload([]);
      setImportHistory(prevHistory => [result, ...prevHistory]);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Ocorreu um erro no servidor.';
      showErrorToast('Erro na Importação', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDetails = async (historyId: string) => {
    setIsDetailsModalOpen(true);
    setIsModalLoading(true);
    try {
      const details = await ImportService.getImportHistoryDetails(historyId);
      setSelectedHistoryDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      showErrorToast('Erro ao Carregar Detalhes', errorMessage);
      setIsDetailsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };
  
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedHistoryDetails(null);
  };
  
  const handleDeleteClick = (historyItem: ImportHistory) => {
    setHistoryToDelete(historyItem);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!historyToDelete) return;

    setIsDeleting(true);
    try {
      await ImportService.deleteImportHistory(historyToDelete.id);
      setImportHistory(prev => prev.filter(item => item.id !== historyToDelete.id));
      showSuccessToast('Sucesso', `A importação "${historyToDelete.fileName}" foi deletada.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar.';
      showErrorToast('Erro ao Deletar', errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setHistoryToDelete(null);
    }
  };

  const formatBytes = (bytes: number | null, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const StatusIcon = ({ status }: { status: ImportHistory['overallStatus'] }) => {
    const iconMap = {
      SUCCESS: <CheckCircle className="w-5 h-5 text-green-500" />,
      PARTIAL_SUCCESS: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      ERROR: <XCircle className="w-5 h-5 text-red-500" />,
      IN_PROGRESS: <Loader className="w-5 h-5 text-blue-500 animate-spin" />,
    };
    return iconMap[status] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Erro ao carregar dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Importar Histórico</h1>
          <p className="text-gray-600 mt-1">Envie o histórico dos colaboradores para o sistema.</p>

          <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 hover:border-teal-400">
                <input {...getInputProps()} />
                <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="font-semibold text-gray-700">Arraste ou clique para selecionar o arquivo</p>
                <p className="text-sm text-gray-500">Apenas .xlsx ou .xls, 1 arquivo por vez</p>
              </div>
            </div>
            {filesToUpload.length > 0 && (
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-800"><b>Arquivo selecionado:</b> {filesToUpload[0].name}</p>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleUpload} disabled={isUploading} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 disabled:opacity-50">
                    {isUploading ? 'Importando...' : 'Importar Arquivo'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Importações</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Criados</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Erros</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importHistory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><FileText className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" /><div><div className="text-sm font-medium text-gray-900">{item.fileName}</div><div className="text-xs text-gray-500">{formatBytes(item.fileSize)}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{new Date(item.uploadDate).toLocaleString('pt-BR')}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center"><div className="flex items-center justify-center gap-2"><StatusIcon status={item.overallStatus} /><span>{item.overallStatus}</span></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">{item.totalRecordsCreated}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-red-600">{item.totalErrors}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleViewDetails(item.id)} className="p-2 text-teal-600 hover:bg-teal-100 rounded-lg" title="Ver detalhes"><Eye className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteClick(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Deletar"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isDetailsModalOpen && (
        <ImportDetailsModal
          details={selectedHistoryDetails}
          onClose={handleCloseDetailsModal}
          isLoading={isModalLoading}
        />
      )}
      
      {isDeleteModalOpen && historyToDelete && (
        <DeleteConfirmationModal
          itemNameToDelete={historyToDelete.fileName}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default HRImport;