import { type FC, useEffect, useState } from 'react';
import DashboardService from '../../../services/ManagerService';
import { useAuth } from '../../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import CollaboratorsTableWithPagination from '../../../components/CollaboratorsTableWithPagination';

const ManagerCollaborators: FC = () => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<DashboardSubordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagerCollaborators = async () => {
      if (!user || user.roles.length === 0) {
        setError('Usuário não autenticado ou papéis não disponíveis.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const activeCycle = await DashboardService.getActiveCycle();
        if (!activeCycle || activeCycle.status !== 'OPEN') {
          setError('Nenhum ciclo de avaliação ativo encontrado ou o ciclo não está aberto.');
          setIsLoading(false);
          return;
        }
        const dashboardData = await DashboardService.getManagerDashboard(activeCycle.name);
        const allSubordinates: DashboardSubordinate[] = dashboardData.collaboratorsInfo.flatMap(
          group => group.subordinates,
        );
        setCollaborators(allSubordinates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar colaboradores.');
      } finally {
        setIsLoading(false);
      }
    };

    // Busca os dados na carga inicial
    fetchManagerCollaborators();

    // Adiciona um "ouvinte" que busca os dados sempre que a janela ganha foco
    window.addEventListener('focus', fetchManagerCollaborators);

    // Remove o "ouvinte" quando o componente é desmontado
    return () => {
      window.removeEventListener('focus', fetchManagerCollaborators);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]'></div>
        <p className='ml-4 text-gray-700'>Carregando colaboradores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar dados</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors'
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-6'>Meus Colaboradores</h1>

      {/* Tabela paginada de colaboradores */}
      <CollaboratorsTableWithPagination collaborators={collaborators} />
    </div>
  );
};

export default ManagerCollaborators;
