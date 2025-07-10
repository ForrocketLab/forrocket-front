import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Loader, Users, Search, X } from 'lucide-react';
import CollaboratorRow from './CollaboratorRow';

// Importing types - adjust path as needed
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

interface CollaboratorsTableWithPaginationProps {
  collaborators: DashboardSubordinate[];
  paginationMeta: PaginationMeta | null;
  currentPage: number;
  sortBy: 'name' | 'status' | 'position' | 'department';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  isLoading: boolean;
  onSort: (column: 'name' | 'status' | 'position' | 'department') => void;
  onPageChange: (page: number) => void;
  onSearch: (searchTerm: string) => void;
  onClearSearch: () => void;
  viewMoreLink?: string;
}

const CollaboratorsTableWithPagination: FC<CollaboratorsTableWithPaginationProps> = ({
  collaborators,
  paginationMeta,
  currentPage,
  sortBy,
  sortOrder,
  searchTerm,
  isLoading,
  onSort,
  onPageChange,
  onSearch,
  onClearSearch,
  viewMoreLink = '#',
}) => {
  const SortIcon = ({ column }: { column: 'name' | 'status' | 'position' | 'department' }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className='w-4 h-4 text-gray-400' />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className='w-4 h-4 text-gray-600' />
    ) : (
      <ArrowDown className='w-4 h-4 text-gray-600' />
    );
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative'>
      {/* Overlay de loading para ações de paginação/ordenação */}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
          <Loader className='w-6 h-6 animate-spin text-teal-600' />
        </div>
      )}

      {/* Cabeçalho com título e link "Ver mais" */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-semibold text-gray-800'>Colaboradores</h2>
          <Link to={viewMoreLink} className='text-sm text-teal-600 font-semibold hover:underline'>
            Ver mais
          </Link>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Buscar colaborador por nome...'
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            disabled={isLoading}
            className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed'
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              disabled={isLoading}
              className='absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              title='Limpar busca'
            >
              <X className='w-5 h-5 text-gray-400 hover:text-gray-600' />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className='mt-2 text-sm text-gray-600'>
            Buscando por: <span className='font-semibold'>&quot;{searchTerm}&quot;</span>
          </div>
        )}
      </div>

      {collaborators.length === 0 && !isLoading ? (
        <div className='p-8 text-center text-gray-500'>
          <Users className='w-12 h-12 mx-auto mb-4 text-gray-300' />
          <p>Nenhum colaborador encontrado.</p>
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            {/* Header com estrutura de grid consistente */}
            <div className='px-6 py-3 border-b border-gray-200'>
              <div className='grid grid-cols-12 gap-4 items-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <div
                  className={`col-span-4 cursor-pointer flex items-center space-x-1 hover:text-gray-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isLoading && onSort('name')}
                >
                  <span>Colaborador</span>
                  <SortIcon column='name' />
                </div>
                <div
                  className={`col-span-2 cursor-pointer flex items-center space-x-1 hover:text-gray-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isLoading && onSort('status')}
                >
                  <span>Status</span>
                  <SortIcon column='status' />
                </div>
                <div className='col-span-2 text-center'>Autoavaliação</div>
                <div className='col-span-2 text-center'>Nota Gestor</div>
                <div className='col-span-2 text-center'>Ações</div>
              </div>
            </div>

            {/* Container com altura mínima para layout consistente */}
            <div className='min-h-[640px] bg-white'>
              {/* Linhas de colaboradores */}
              {collaborators.map(collaborator => (
                <CollaboratorRow key={collaborator.id} {...collaborator} />
              ))}

              {/* Linhas vazias para manter altura consistente quando há menos de 10 colaboradores */}
              {collaborators.length < 10 &&
                Array.from({ length: 10 - collaborators.length }, (_, index) => (
                  <div key={`empty-${index}`} className='px-6 py-4 min-h-[64px]' />
                ))}
            </div>
          </div>

          {/* Controles de Paginação */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className='px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4'>
              {/* Informações da Paginação */}
              <div className='flex items-center space-x-2 text-sm text-gray-700'>
                <span>
                  Mostrando {(paginationMeta.page - 1) * paginationMeta.limit + 1} até{' '}
                  {Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)} de {paginationMeta.total}{' '}
                  colaboradores
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
                    {sortBy === 'name' && 'Nome'}
                    {sortBy === 'status' && 'Status'}
                    {sortBy === 'position' && 'Cargo'}
                    {sortBy === 'department' && 'Departamento'}
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

export default CollaboratorsTableWithPagination;
