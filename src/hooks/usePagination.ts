import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: 'importedAt' | 'fileName' | 'status';
  initialSortOrder?: 'asc' | 'desc';
}

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  sortBy: 'importedAt' | 'fileName' | 'status';
  sortOrder: 'asc' | 'desc';
  setCurrentPage: (page: number) => void;
  setSortBy: (sortBy: 'importedAt' | 'fileName' | 'status') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  handleSort: (column: 'importedAt' | 'fileName' | 'status') => void;
  handlePageChange: (newPage: number) => void;
  resetToFirstPage: () => void;
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  initialSortBy = 'importedAt',
  initialSortOrder = 'desc',
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(initialLimit);
  const [sortBy, setSortBy] = useState<'importedAt' | 'fileName' | 'status'>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const handleSort = useCallback(
    (column: 'importedAt' | 'fileName' | 'status') => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('desc');
      }
      setCurrentPage(1); // Reset to first page when sorting
    },
    [sortBy, sortOrder],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    setCurrentPage,
    setSortBy,
    setSortOrder,
    handleSort,
    handlePageChange,
    resetToFirstPage,
  };
};
