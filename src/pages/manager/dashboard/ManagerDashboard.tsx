import CycleStatus from './components/CycleStatus';
import CollaboratorsTableWithPagination from './components/CollaboratorsTableWithPagination';
import { useEffect, useState, useRef } from 'react';
import DashboardService from '../../../services/ManagerService';
import { useAuth } from '../../../hooks/useAuth';
import { useCollaboratorsPagination } from '../../../hooks/useCollaboratorsPagination';
import DetailedScoreCard from '../../../components/DetailedScoreCard';
import DetailedEvaluationsCard from '../../../components/DetailedEvaluationsCard';
import PendingReviewsCard from '../../../components/PendingReviewsCard';

const ManagerDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<ManagerDashboardResponse | null>(null);
  const [activeCycle, setActiveCycle] = useState<ActiveCycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for collaborators
  const [collaboratorsList, setCollaboratorsList] = useState<DashboardSubordinate[]>([]);
  const [paginatedCollaborators, setPaginatedCollaborators] = useState<DashboardSubordinate[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null>(null);
  const [isCollaboratorsLoading, setIsCollaboratorsLoading] = useState(false);
  const isFirstLoad = useRef(true);

  // Hook for pagination state management
  const {
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    searchTerm,
    handleSort,
    handlePageChange,
    handleSearch,
    clearSearch,
  } = useCollaboratorsPagination({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
    initialLimit: 10,
  });

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cycle = await DashboardService.getActiveCycle();
        setActiveCycle(cycle);

        if (cycle) {
          const data = await DashboardService.getManagerDashboard(cycle.name);
          setDashboardData(data);

          // Extract all collaborators from the response
          const allCollaborators = data.collaboratorsInfo.flatMap(projectGroup => projectGroup.subordinates);
          setCollaboratorsList(allCollaborators);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    user?.roles.forEach(role => {
      console.log(`Usuário tem o papel: ${role}`);
    });
  }, [user?.roles]);

  // Effect to handle collaborators pagination and search
  useEffect(() => {
    if (collaboratorsList.length === 0) return;

    const handleCollaboratorsPagination = () => {
      // Set loading state - avoid scroll jump
      if (!isFirstLoad.current) {
        setIsCollaboratorsLoading(true);
      }

      // Filter collaborators based on search term
      let filteredCollaborators = collaboratorsList;
      if (searchTerm) {
        filteredCollaborators = collaboratorsList.filter(
          collaborator =>
            collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collaborator.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // Sort collaborators
      const sortedCollaborators = [...filteredCollaborators].sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortBy) {
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
            // Since department is not available, we'll use jobTitle as fallback
            aValue = a.jobTitle?.toLowerCase() || '';
            bValue = b.jobTitle?.toLowerCase() || '';
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      // Calculate pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = sortedCollaborators.slice(startIndex, endIndex);

      // Set paginated data and meta
      setPaginatedCollaborators(paginatedData);
      setPaginationMeta({
        page: currentPage,
        limit: itemsPerPage,
        total: sortedCollaborators.length,
        totalPages: Math.ceil(sortedCollaborators.length / itemsPerPage),
        hasNext: endIndex < sortedCollaborators.length,
        hasPrevious: currentPage > 1,
      });

      setIsCollaboratorsLoading(false);
      isFirstLoad.current = false;
    };

    // Small delay to show loading state
    const timer = setTimeout(handleCollaboratorsPagination, isFirstLoad.current ? 0 : 100);
    return () => clearTimeout(timer);
  }, [collaboratorsList, currentPage, itemsPerPage, sortBy, sortOrder, searchTerm]);

  // 3. Renderização condicional
  if (isLoading) {
    return <div className='p-8'>Carregando dados do dashboard...</div>;
  }

  if (error) {
    return <div className='p-8 text-red-600'>Erro: {error}</div>;
  }

  if (!dashboardData || !activeCycle) {
    return <div className='p-8'>Nenhum ciclo de avaliação ativo encontrado.</div>;
  }

  return (
    <div className='bg-gray-100 min-h-screen'>
      {/* Olá, Gestor e Botão de Perfil */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-semibold text-gray-800'>Olá, Gestor</h1>
        <button className='bg-gray-300 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center uppercase font-semibold'>
          {userInitials}
        </button>
      </div>

      {/* Indicador do Ciclo */}
      <CycleStatus cycleName={activeCycle.name} isActive={activeCycle.status === 'OPEN'} />

      {/* Cards de Resumo */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <DetailedScoreCard
          title='Sua Nota Atual'
          description={`Nota final do ciclo realizado em ${activeCycle.name}.`}
          score={typeof dashboardData.summary.overallScore === 'number' ? dashboardData.summary.overallScore : null}
        />
        <DetailedEvaluationsCard
          title='Preenchimento do Time'
          description={`${dashboardData.summary.completionPercentage} por cento dos seus liderados já fecharam suas avaliações`}
          percentage={dashboardData.summary.completionPercentage}
        />
        <PendingReviewsCard title='Revisões Pendentes' pendingCount={dashboardData.summary.incompleteReviews} />
      </div>

      <CollaboratorsTableWithPagination
        collaborators={paginatedCollaborators}
        paginationMeta={paginationMeta}
        currentPage={currentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchTerm={searchTerm}
        isLoading={isCollaboratorsLoading}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        viewMoreLink='/manager/collaborators'
      />
    </div>
  );
};

export default ManagerDashboardPage;
