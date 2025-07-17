import { type FC } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Loader,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { ImportBatch, PaginationMeta } from '../../../types/import';

interface ImportHistoryDataGridProps {
  batches: ImportBatch[];
  paginationMeta: PaginationMeta | null;
  currentPage: number;
  sortBy: 'importedAt' | 'fileName' | 'status';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  onSort: (column: 'importedAt' | 'fileName' | 'status') => void;
  onPageChange: (page: number) => void;
  onDeleteBatch: (batchId: string, fileName: string) => void;
}

const ImportHistoryDataGrid: FC<ImportHistoryDataGridProps> = ({
  batches,
  paginationMeta,
  currentPage,
  sortBy,
  sortOrder,
  isLoading,
  onSort,
  onPageChange,
  onDeleteBatch,
}) => {
  const SortIcon = ({ column }: { column: 'importedAt' | 'fileName' | 'status' }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className='w-4 h-4 text-gray-400' />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className='w-4 h-4 text-gray-600' />
    ) : (
      <ArrowDown className='w-4 h-4 text-gray-600' />
    );
  };

  const StatusIcon = ({ status }: { status: ImportBatch['status'] }) => {
    const iconMap = {
      COMPLETED: <CheckCircle className='w-5 h-5 text-green-500' />,
      SUCCESS: <CheckCircle className='w-5 h-5 text-green-500' />, // Compatibilidade com backend
      PROCESSING: <Loader className='w-5 h-5 text-blue-500 animate-spin' />,
      ERROR: <XCircle className='w-5 h-5 text-red-500' />,
    };
    return iconMap[status] || null;
  };

  const getStatusText = (status: ImportBatch['status']) => {
    if (status === 'COMPLETED' || status === 'SUCCESS') return 'Concluído';
    if (status === 'PROCESSING') return 'Processando';
    if (status === 'ERROR') return 'Erro';
    return status;
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative'>
      {/* Overlay de loading para ações de paginação/ordenação */}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
          <Loader className='w-6 h-6 animate-spin text-teal-600' />
        </div>
      )}

      {batches.length === 0 && !isLoading ? (
        <div className='p-8 text-center text-gray-500'>
          <FileText className='w-12 h-12 mx-auto mb-4 text-gray-300' />
          <p>Nenhuma importação encontrada.</p>
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors ${
                      isLoading ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer hover:bg-gray-100'
                    }`}
                    onClick={() => !isLoading && onSort('fileName')}
                  >
                    <div className='flex items-center space-x-1'>
                      <span>Arquivo</span>
                      <SortIcon column='fileName' />
                    </div>
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors ${
                      isLoading ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer hover:bg-gray-100'
                    }`}
                    onClick={() => !isLoading && onSort('importedAt')}
                  >
                    <div className='flex items-center space-x-1'>
                      <span>Data de Importação</span>
                      <SortIcon column='importedAt' />
                    </div>
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuário
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors ${
                      isLoading ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer hover:bg-gray-100'
                    }`}
                    onClick={() => !isLoading && onSort('status')}
                  >
                    <div className='flex items-center justify-center space-x-1'>
                      <span>Status</span>
                      <SortIcon column='status' />
                    </div>
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
                {batches.map(batch => (
                  <tr key={batch.id} className='hover:bg-gray-50 transition-colors'>
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
                      <div className='text-sm text-gray-900'>{new Date(batch.importedAt).toLocaleString('pt-BR')}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>{batch.uploadedUser.name}</div>
                      <div className='text-xs text-gray-500'>{batch.uploadedUser.email}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <StatusIcon status={batch.status} />
                        <span className='text-sm'>{getStatusText(batch.status)}</span>
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
                              {batch._count.createdSelfAssessments} autoavaliação
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
                          onClick={() => !isLoading && onDeleteBatch(batch.id, batch.fileName)}
                          disabled={isLoading}
                          className='p-2 text-red-600 hover:bg-red-100 hover:cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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

          {/* Controles de Paginação */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className='px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4'>
              {/* Informações da Paginação */}
              <div className='flex items-center space-x-2 text-sm text-gray-700'>
                <span>
                  Mostrando {(paginationMeta.page - 1) * paginationMeta.limit + 1} até{' '}
                  {Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)} de {paginationMeta.total}{' '}
                  resultados
                </span>
              </div>

              {/* Controles de Navegação */}
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => !isLoading && onPageChange(currentPage - 1)}
                  disabled={!paginationMeta.hasPrevious || isLoading}
                  className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='Página anterior'
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>

                {/* Numeração das Páginas */}
                <div className='flex items-center space-x-1'>
                  {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1)
                    .filter(
                      page => page === 1 || page === paginationMeta.totalPages || Math.abs(page - currentPage) <= 2,
                    )
                    .map((page, index, array) => (
                      <div key={page} className='flex items-center'>
                        {index > 0 && array[index - 1] !== page - 1 && <span className='px-2 text-gray-400'>...</span>}
                        <button
                          onClick={() => !isLoading && onPageChange(page)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            page === currentPage
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 hover:cursor-pointer'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => !isLoading && onPageChange(currentPage + 1)}
                  disabled={!paginationMeta.hasNext || isLoading}
                  className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='Próxima página'
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          )}

          {/* Informações Adicionais da Paginação */}
          {paginationMeta && (
            <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
              <div className='flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2'>
                <div className='flex items-center space-x-4'>
                  <span>
                    Página {paginationMeta.page} de {paginationMeta.totalPages}
                  </span>
                  <span>|</span>
                  <span>{paginationMeta.limit} itens por página</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span>Ordenação:</span>
                  <span className='font-medium capitalize'>
                    {sortBy === 'importedAt' && 'Data de Importação'}
                    {sortBy === 'fileName' && 'Nome do Arquivo'}
                    {sortBy === 'status' && 'Status'}
                  </span>
                  <span>({sortOrder === 'asc' ? 'Crescente' : 'Decrescente'})</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImportHistoryDataGrid;
