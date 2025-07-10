import { type FC, useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader,
  Users,
  Search,
  X,
  Filter,
} from 'lucide-react';
import CollaboratorRow from './CollaboratorRow';
import FilterStatusPopup from '../pages/manager/dashboard/components/FilterStatusPopup';

interface CollaboratorsTableWithPaginationProps {
  collaborators: DashboardSubordinate[];
  currentPage?: number;
  itemsPerPage?: number;
  sortBy?: 'name' | 'status' | 'position' | 'department';
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  filterStatus?: string;
  onSort?: (column: 'name' | 'status' | 'position' | 'department') => void;
  onPageChange?: (page: number) => void;
  onSearch?: (searchTerm: string) => void;
  onClearSearch?: () => void;
  onFilterChange?: (status: string) => void;
  onClearFilter?: () => void;
  viewMoreLink?: string;
}

const CollaboratorsTableWithPagination: FC<CollaboratorsTableWithPaginationProps> = ({
  collaborators,
  currentPage = 1,
  itemsPerPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  searchTerm = '',
  filterStatus = 'ALL',
  onSort,
  onPageChange,
  onSearch,
  onClearSearch,
  onFilterChange,
  onClearFilter,
  viewMoreLink = '#',
}) => {
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPopupRef = useRef<HTMLDivElement>(null);

  // Estados internos para quando não há controle externo
  const [internalCurrentPage, setInternalCurrentPage] = useState(currentPage);
  const [internalSortBy, setInternalSortBy] = useState(sortBy);
  const [internalSortOrder, setInternalSortOrder] = useState(sortOrder);
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);
  const [internalFilterStatus, setInternalFilterStatus] = useState(filterStatus);

  // Usar estados internos ou externos dependendo das props
  const actualCurrentPage = onPageChange ? currentPage : internalCurrentPage;
  const actualSortBy = onSort ? sortBy : internalSortBy;
  const actualSortOrder = onSort ? sortOrder : internalSortOrder;
  const actualSearchTerm = onSearch ? searchTerm : internalSearchTerm;
  const actualFilterStatus = onFilterChange ? filterStatus : internalFilterStatus;

  // Processar dados com filtros, busca e ordenação
  const processedData = useMemo(() => {
    setIsLoading(true);

    // Aplicar filtros
    let filteredCollaborators = collaborators;

    // Filtro por status
    if (actualFilterStatus !== 'ALL') {
      filteredCollaborators = filteredCollaborators.filter(
        collaborator => collaborator.assessmentStatus === actualFilterStatus,
      );
    }

    // Filtro por busca
    if (actualSearchTerm) {
      filteredCollaborators = filteredCollaborators.filter(
        collaborator =>
          collaborator.name.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
          collaborator.jobTitle?.toLowerCase().includes(actualSearchTerm.toLowerCase()),
      );
    }

    // Ordenar
    const sortedCollaborators = [...filteredCollaborators].sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (actualSortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.assessmentStatus?.toLowerCase() || '';
          bValue = b.assessmentStatus?.toLowerCase() || '';
          break;
        case 'position':
          aValue = a.jobTitle?.toLowerCase() || '';
          bValue = b.jobTitle?.toLowerCase() || '';
          break;
        case 'department':
          aValue = a.jobTitle?.toLowerCase() || '';
          bValue = b.jobTitle?.toLowerCase() || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (actualSortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    // Paginar
    const startIndex = (actualCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedCollaborators.slice(startIndex, endIndex);

    const paginationMeta = {
      page: actualCurrentPage,
      limit: itemsPerPage,
      total: sortedCollaborators.length,
      totalPages: Math.ceil(sortedCollaborators.length / itemsPerPage),
      hasNext: endIndex < sortedCollaborators.length,
      hasPrevious: actualCurrentPage > 1,
    };

    setTimeout(() => setIsLoading(false), 100);

    return {
      collaborators: paginatedData,
      paginationMeta,
    };
  }, [
    collaborators,
    actualCurrentPage,
    actualSortBy,
    actualSortOrder,
    actualSearchTerm,
    actualFilterStatus,
    itemsPerPage,
  ]);

  // Efeito para fechar o popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node) &&
        filterPopupRef.current &&
        !filterPopupRef.current.contains(event.target as Node)
      ) {
        setIsFilterPopupOpen(false);
      }
    };

    if (isFilterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPopupOpen]);

  // Handlers
  const handleSort = (column: 'name' | 'status' | 'position' | 'department') => {
    if (onSort) {
      onSort(column);
    } else {
      if (actualSortBy === column) {
        setInternalSortOrder(actualSortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setInternalSortBy(column);
        setInternalSortOrder('asc');
      }
      setInternalCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      setInternalSearchTerm(searchTerm);
      setInternalCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      setInternalSearchTerm('');
      setInternalCurrentPage(1);
    }
  };

  const handleFilterChange = (status: string) => {
    if (onFilterChange) {
      onFilterChange(status);
    } else {
      setInternalFilterStatus(status);
      setInternalCurrentPage(1);
    }
  };

  const handleClearFilter = () => {
    if (onClearFilter) {
      onClearFilter();
    } else {
      setInternalFilterStatus('ALL');
      setInternalCurrentPage(1);
    }
  };

  // Função para lidar com a seleção de status e fechar o popup
  const handleSelectStatus = (status: string) => {
    handleFilterChange(status);
    setIsFilterPopupOpen(false);
  };

  // Função para limpar o filtro e fechar o popup
  const handleClearFilterAndClosePopup = () => {
    handleClearFilter();
    setIsFilterPopupOpen(false);
  };

  const SortIcon = ({ column }: { column: 'name' | 'status' | 'position' | 'department' }) => {
    if (actualSortBy !== column) {
      return <ArrowUpDown className='w-4 h-4 text-gray-400' />;
    }
    return actualSortOrder === 'asc' ? (
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

      {/* Barra de Busca e Filtros */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex gap-4 items-center relative'>
          {/* Barra de Busca */}
          <div className='flex-1 relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search className='w-5 h-5 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Buscar colaborador por nome...'
              value={actualSearchTerm}
              onChange={e => handleSearch(e.target.value)}
              disabled={isLoading}
              className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed'
            />
            {actualSearchTerm && (
              <button
                onClick={handleClearSearch}
                disabled={isLoading}
                className='absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                title='Limpar busca'
              >
                <X className='w-5 h-5 text-gray-400 hover:text-gray-600' />
              </button>
            )}
          </div>

          {/* Botão de Filtro */}
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
            disabled={isLoading}
            className='bg-[#085F60] p-2 rounded-lg text-white hover:bg-[#064b4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Filtrar por status'
          >
            <Filter className='w-5 h-5' />
          </button>

          {/* Botão de Limpar Filtro - Só aparece quando um filtro está ativo */}
          {actualFilterStatus !== 'ALL' && (
            <button
              onClick={handleClearFilterAndClosePopup}
              disabled={isLoading}
              className='bg-red-500 px-3 py-2 rounded-lg text-white hover:bg-red-600 transition-colors whitespace-nowrap text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              title='Limpar filtro de status'
            >
              Limpar filtro
            </button>
          )}

          {/* Popup de Filtro */}
          {isFilterPopupOpen && (
            <div ref={filterPopupRef} className='absolute top-full right-0 mt-2 z-30'>
              <FilterStatusPopup currentStatus={actualFilterStatus} onSelectStatus={handleSelectStatus} />
            </div>
          )}
        </div>

        {/* Feedback de busca e filtro */}
        <div className='mt-2 flex flex-wrap gap-2 text-sm text-gray-600'>
          {actualSearchTerm && (
            <span>
              Buscando por: <span className='font-semibold'>&quot;{actualSearchTerm}&quot;</span>
            </span>
          )}
          {actualFilterStatus !== 'ALL' && (
            <span>
              {actualSearchTerm && ' | '}
              Filtro: <span className='font-semibold'>{actualFilterStatus}</span>
            </span>
          )}
        </div>
      </div>

      {processedData.collaborators.length === 0 && !isLoading ? (
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
                  onClick={() => !isLoading && handleSort('name')}
                >
                  <span>Colaborador</span>
                  <SortIcon column='name' />
                </div>
                <div
                  className={`col-span-2 cursor-pointer flex items-center space-x-1 hover:text-gray-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isLoading && handleSort('status')}
                >
                  <span>Status</span>
                  <SortIcon column='status' />
                </div>
                <div className='col-span-2 text-center'>Autoavaliação</div>
                <div className='col-span-2 text-center'>Nota Gestor</div>
                <div className='col-span-2 text-center'>Visualizar</div>
              </div>
            </div>

            {/* Container com altura dinâmica baseada no número de colaboradores */}
            <div className='bg-white'>
              {/* Linhas de colaboradores */}
              {processedData.collaborators.map(collaborator => (
                <CollaboratorRow key={collaborator.id} {...collaborator} />
              ))}
            </div>
          </div>

          {/* Controles de Paginação */}
          {processedData.paginationMeta && processedData.paginationMeta.totalPages > 1 && (
            <div className='px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4'>
              {/* Informações da Paginação */}
              <div className='flex items-center space-x-2 text-sm text-gray-700'>
                <span>
                  Mostrando {(processedData.paginationMeta.page - 1) * processedData.paginationMeta.limit + 1} até{' '}
                  {Math.min(
                    processedData.paginationMeta.page * processedData.paginationMeta.limit,
                    processedData.paginationMeta.total,
                  )}{' '}
                  de {processedData.paginationMeta.total} colaboradores
                </span>
              </div>

              {/* Controles de Navegação */}
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => !isLoading && handlePageChange(actualCurrentPage - 1)}
                  disabled={!processedData.paginationMeta.hasPrevious || isLoading}
                  className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='Página anterior'
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>

                {/* Numeração das Páginas */}
                <div className='flex items-center space-x-1'>
                  {Array.from({ length: processedData.paginationMeta.totalPages }, (_, i) => i + 1)
                    .filter(
                      page =>
                        page === 1 ||
                        page === processedData.paginationMeta.totalPages ||
                        Math.abs(page - actualCurrentPage) <= 2,
                    )
                    .map((page, index, array) => (
                      <div key={page} className='flex items-center'>
                        {index > 0 && array[index - 1] !== page - 1 && <span className='px-2 text-gray-400'>...</span>}
                        <button
                          onClick={() => !isLoading && handlePageChange(page)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            page === actualCurrentPage
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
                  onClick={() => !isLoading && handlePageChange(actualCurrentPage + 1)}
                  disabled={!processedData.paginationMeta.hasNext || isLoading}
                  className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='Próxima página'
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          )}

          {/* Informações Adicionais da Paginação */}
          {processedData.paginationMeta && (
            <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
              <div className='flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2'>
                <div className='flex items-center space-x-4'>
                  <span>
                    Página {processedData.paginationMeta.page} de {processedData.paginationMeta.totalPages}
                  </span>
                  <span>|</span>
                  <span>{processedData.paginationMeta.limit} itens por página</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span>Ordenação:</span>
                  <span className='font-medium capitalize'>
                    {actualSortBy === 'name' && 'Nome'}
                    {actualSortBy === 'status' && 'Status'}
                    {actualSortBy === 'position' && 'Cargo'}
                    {actualSortBy === 'department' && 'Departamento'}
                  </span>
                  <span>({actualSortOrder === 'asc' ? 'Crescente' : 'Decrescente'})</span>
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
