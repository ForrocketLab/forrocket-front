import { type FC, useState, useCallback, useEffect } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  Loader,
  Trash2,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import ImportFileService from '../../services/ImportFileService';

const HRImport: FC = () => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const batchData = await ImportFileService.getImportBatches();
        setImportBatches(batchData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar o histórico de importações.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        showErrorToast('Arquivo(s) Rejeitado(s)', `Apenas arquivos .xlsx e .xls são permitidos.`);
      }
      setFilesToUpload(acceptedFiles);
    },
    [showErrorToast],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: true, // Permitir múltiplos arquivos
  });

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      showErrorToast('Nenhum arquivo', 'Por favor, selecione pelo menos um arquivo para importar.');
      return;
    }
    setIsUploading(true);
    try {
      if (filesToUpload.length === 1) {
        // Upload único
        const result = await ImportFileService.uploadExcelFile(filesToUpload[0]);
        showSuccessToast('Sucesso', result.message);
      } else {
        // Upload múltiplo
        const result = await ImportFileService.uploadMultipleExcelFiles(filesToUpload);
        showSuccessToast('Sucesso', result.message);

        // Mostrar detalhes dos arquivos processados se houver falhas
        if (result.failedFiles > 0) {
          const failedDetails = result.fileResults
            .filter(file => file.status === 'ERROR')
            .map(file => `${file.fileName}: ${file.message}`)
            .join('\n');
          showErrorToast('Alguns arquivos falharam', failedDetails);
        }
      }

      setFilesToUpload([]);

      // Recarregar o histórico para mostrar a nova importação
      const batchData = await ImportFileService.getImportBatches();
      setImportBatches(batchData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro no servidor.';
      showErrorToast('Erro na Importação', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBatch = async (batchId: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o lote "${fileName}"?`)) return;

    try {
      await ImportFileService.deleteBatch(batchId);
      setImportBatches(prev => prev.filter(batch => batch.id !== batchId));
      showSuccessToast('Sucesso', `Lote "${fileName}" foi deletado.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar.';
      showErrorToast('Erro ao Deletar', errorMessage);
    }
  };

  const StatusIcon = ({ status }: { status: ImportBatch['status'] }) => {
    const iconMap = {
      COMPLETED: <CheckCircle className='w-5 h-5 text-green-500' />,
      PROCESSING: <Loader className='w-5 h-5 text-blue-500 animate-spin' />,
      ERROR: <XCircle className='w-5 h-5 text-red-500' />,
    };
    return iconMap[status] || null;
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader className='w-8 h-8 animate-spin text-teal-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center'>
        <AlertCircleIcon className='w-12 h-12 text-red-500 mb-4' />
        <h3 className='text-lg font-medium text-gray-900'>Erro ao carregar dados</h3>
        <p className='text-gray-600 mb-4'>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className='bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 hover:cursor-pointer'
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-900'>Importar Histórico</h1>
          <p className='text-gray-600 mt-1'>Envie o histórico dos colaboradores para o sistema.</p>

          <div className='mt-6 bg-white border border-gray-200 rounded-lg shadow-sm'>
            <div className='p-6'>
              <div
                {...getRootProps()}
                className='border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 hover:border-teal-400 hover:cursor-pointer'
              >
                <input {...getInputProps()} />
                <UploadCloud className='w-12 h-12 mx-auto text-gray-400 mb-4' />
                <p className='font-semibold text-gray-700'>Arraste ou clique para selecionar os arquivos</p>
                <p className='text-sm text-gray-500'>Apenas .xlsx ou .xls, múltiplos arquivos permitidos</p>
              </div>
            </div>
            {filesToUpload.length > 0 && (
              <div className='px-6 pb-6'>
                <div className='text-sm text-gray-800 mb-3'>
                  <b>Arquivo(s) selecionado(s):</b> {filesToUpload.length} arquivo(s)
                </div>
                <div className='max-h-32 overflow-y-auto mb-4'>
                  {filesToUpload.map((file, index) => (
                    <div key={index} className='flex items-center justify-between py-2 px-3 bg-gray-50 rounded mb-2'>
                      <div className='flex items-center'>
                        <FileText className='w-4 h-4 text-gray-400 mr-2' />
                        <span className='text-sm text-gray-700'>{file.name}</span>
                      </div>
                      <button
                        onClick={() => setFilesToUpload(files => files.filter((_, i) => i !== index))}
                        className='text-red-500 hover:text-red-700 hover:cursor-pointer text-sm'
                        title='Remover arquivo'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className='flex justify-end'>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className='px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isUploading ? 'Importando...' : `Importar ${filesToUpload.length} Arquivo(s)`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='mt-8'>
            <h2 className='text-xl font-bold text-gray-800 mb-4'>Histórico de Importações</h2>
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
              {importBatches.length === 0 ? (
                <div className='p-8 text-center text-gray-500'>
                  <FileText className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p>Nenhuma importação encontrada.</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Arquivo
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Data de Importação
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Usuário
                        </th>
                        <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Registros Criados
                        </th>
                        <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {importBatches.map(batch => (
                        <tr key={batch.id} className='hover:bg-gray-50 hover:cursor-pointer'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <FileText className='w-5 h-5 text-gray-400 mr-3 flex-shrink-0' />
                              <div>
                                <div className='text-sm font-medium text-gray-900'>{batch.fileName}</div>
                                {batch.notes && <div className='text-xs text-gray-500'>{batch.notes}</div>}
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              {new Date(batch.importedAt).toLocaleString('pt-BR')}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>{batch.uploadedUser.name}</div>
                            <div className='text-xs text-gray-500'>{batch.uploadedUser.email}</div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-center'>
                            <div className='flex items-center justify-center gap-2'>
                              <StatusIcon status={batch.status} />
                              <span className='text-sm'>
                                {batch.status === 'COMPLETED' && 'Concluído'}
                                {batch.status === 'PROCESSING' && 'Processando'}
                                {batch.status === 'ERROR' && 'Erro'}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-center'>
                            <div className='text-sm text-gray-900'>
                              <div className='flex flex-col items-center space-y-1'>
                                <div className='flex items-center space-x-2 text-xs'>
                                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                                    {batch._count.createdUsers} usuários
                                  </span>
                                </div>
                                <div className='flex items-center space-x-2 text-xs'>
                                  <span className='bg-green-100 text-green-800 px-2 py-1 rounded'>
                                    {batch._count.createdSelfAssessments} autoavaliações
                                  </span>
                                </div>
                                <div className='flex items-center space-x-2 text-xs'>
                                  <span className='bg-purple-100 text-purple-800 px-2 py-1 rounded'>
                                    {batch._count.createdAssessments360} avaliações 360
                                  </span>
                                </div>
                                <div className='flex items-center space-x-2 text-xs'>
                                  <span className='bg-orange-100 text-orange-800 px-2 py-1 rounded'>
                                    {batch._count.createdReferenceFeedbacks} feedbacks
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-center'>
                            <div className='flex justify-center items-center gap-2'>
                              <button
                                onClick={() => handleDeleteBatch(batch.id, batch.fileName)}
                                className='p-2 text-red-600 hover:bg-red-100 hover:cursor-pointer rounded-lg'
                                title='Deletar lote'
                              >
                                <Trash2 className='w-5 h-5' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HRImport;
