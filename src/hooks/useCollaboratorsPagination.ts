import { useState, useCallback } from 'react';

interface UseCollaboratorsPaginationProps {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: 'name' | 'status' | 'position' | 'department';
  initialSortOrder?: 'asc' | 'desc';
  initialSearchTerm?: string;
}

interface UseCollaboratorsPaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  sortBy: 'name' | 'status' | 'position' | 'department';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
  setCurrentPage: (page: number) => void;
  setSortBy: (sortBy: 'name' | 'status' | 'position' | 'department') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setSearchTerm: (searchTerm: string) => void;
  handleSort: (column: 'name' | 'status' | 'position' | 'department') => void;
  handlePageChange: (newPage: number) => void;
  handleSearch: (searchTerm: string) => void;
  resetToFirstPage: () => void;
  clearSearch: () => void;
}

export const useCollaboratorsPagination = ({
  initialPage = 1,
  initialLimit = 10,
  initialSortBy = 'name',
  initialSortOrder = 'asc',
  initialSearchTerm = '',
}: UseCollaboratorsPaginationProps = {}): UseCollaboratorsPaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(initialLimit);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'position' | 'department'>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const handleSort = useCallback(
    (column: 'name' | 'status' | 'position' | 'department') => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
      setCurrentPage(1); // Reset to first page when sorting
    },
    [sortBy, sortOrder],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    searchTerm,
    setCurrentPage,
    setSortBy,
    setSortOrder,
    setSearchTerm,
    handleSort,
    handlePageChange,
    handleSearch,
    resetToFirstPage,
    clearSearch,
  };
};
