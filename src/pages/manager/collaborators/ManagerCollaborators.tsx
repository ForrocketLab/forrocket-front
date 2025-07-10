import { type FC, useEffect, useState, useMemo, useRef } from 'react';
import DashboardService from '../../../services/ManagerService';
import { useAuth } from '../../../hooks/useAuth';
import { AlertCircle, Search, Filter } from 'lucide-react';
import FilterStatusPopup from '../dashboard/components/FilterStatusPopup';
import CollaboratorRow from '../dashboard/components/CollaboratorRow';

const ManagerCollaborators: FC = () => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<DashboardSubordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  // Efeito para fechar o popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const filteredCollaborators = useMemo(() => {
    let currentCollaborators = collaborators;

    // Aplica o filtro de busca
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentCollaborators = currentCollaborators.filter(
        collaborator =>
          collaborator.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          collaborator.jobTitle.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    // Aplica o filtro de status
    if (filterStatus !== 'ALL') {
      currentCollaborators = currentCollaborators.filter(collaborator => collaborator.assessmentStatus === filterStatus);
    }

    return currentCollaborators;
  }, [collaborators, searchTerm, filterStatus]);

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

  // Função para lidar com a seleção de status e fechar o popup
  const handleSelectStatus = (status: string) => {
    setFilterStatus(status);
    setIsPopupOpen(false);
  };

  // Função para limpar o filtro
  const handleClearFilter = () => {
    setFilterStatus('ALL');
    setIsPopupOpen(false);
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-6'>Meus Colaboradores</h1>

      {/* Barra de Busca e Botões de Filtro */}
      <div className='mb-6 flex gap-4 items-center relative'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Buscar por colaboradores'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent'
          />
        </div>

        {/* Botão de Filtro - Agora ele abre o popup */}
        <button
          ref={filterButtonRef}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className='bg-[#085F60] p-3 rounded-lg text-white hover:bg-[#064b4c] transition-colors'
        >
          <Filter className='w-4 h-4' />
        </button>

        {/* Botão de Limpar Filtro - Só aparece quando um filtro está ativo */}
        {filterStatus !== 'ALL' && (
          <button
            onClick={handleClearFilter}
            className='bg-red-500 px-4 py-3 rounded-lg text-white hover:bg-red-600 transition-colors whitespace-nowrap text-sm font-medium'
            title='Limpar filtro de status'
          >
            Limpar filtro
          </button>
        )}

        {/* Renderiza o popup se isPopupOpen for true */}
        {isPopupOpen && (
          <div ref={popupRef} className='absolute top-full right-0 mt-2 z-30'>
            <FilterStatusPopup currentStatus={filterStatus} onSelectStatus={handleSelectStatus} />
          </div>
        )}
      </div>

      {/* Lista de colaboradores diretamente renderizada */}
      <div className='flex flex-col'>
        {filteredCollaborators.length > 0 ? (
          filteredCollaborators.map(collaborator => <CollaboratorRow key={collaborator.id} {...collaborator} />)
        ) : (
          <div className='text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200'>
            <p className='text-gray-600'>Nenhum colaborador encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerCollaborators;
