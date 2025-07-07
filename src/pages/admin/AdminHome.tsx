import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthProvider';
import AdminService, { type CycleData, type UserData } from '../../services/AdminService';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import { 
  Users, 
  RefreshCw, 
  Calendar,
  Zap,
  Shield,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

const AdminHomePage = () => {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState<CycleData | null>(null);
  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo
      const [cycleData, cyclesData, usersData] = await Promise.all([
        AdminService.getActiveCycle().catch(() => null),
        AdminService.getAllCycles().catch(() => []),
        AdminService.getAllUsers().catch(() => [])
      ]);
      
      setActiveCycle(cycleData);
      setAllCycles(cyclesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Erro ao carregar dashboard Admin:', err);
      setError('Erro ao carregar dados do dashboard');
      showErrorToast('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-green-600 bg-green-100';
      case 'UPCOMING': return 'text-blue-600 bg-blue-100';
      case 'EQUALIZATION': return 'text-yellow-600 bg-yellow-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': return 'text-blue-600 bg-blue-100';
      case 'MANAGER_REVIEWS': return 'text-orange-600 bg-orange-100';
      case 'EQUALIZATION': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': return 'Avaliações';
      case 'MANAGER_REVIEWS': return 'Gestores';
      case 'EQUALIZATION': return 'Equalização';
      default: return phase;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Aberto';
      case 'UPCOMING': return 'Futuro';
      case 'EQUALIZATION': return 'Equalização';
      case 'CLOSED': return 'Fechado';
      default: return status;
    }
  };

  if (!auth || !auth.isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Não autorizado</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-7 w-7 text-teal-600" />
              Olá, {auth.user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-gray-600 mt-1">
              Painel administrativo do sistema - Controle total das funcionalidades
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ciclo Ativo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Ciclo Ativo</h3>
            <Calendar className="h-5 w-5 text-teal-600" />
          </div>
          {activeCycle ? (
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {activeCycle.name}
              </div>
              <div className="flex gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activeCycle.status)}`}>
                  {getStatusLabel(activeCycle.status)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(activeCycle.phase)}`}>
                  {getPhaseLabel(activeCycle.phase)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Fase atual: {getPhaseLabel(activeCycle.phase)}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum ciclo ativo</p>
            </div>
          )}
        </div>

        {/* Total de Usuários */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Usuários</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {users.length}
          </div>
          <p className="text-sm text-gray-600">
            {users.filter(u => u.isActive).length} ativos • {users.filter(u => !u.isActive).length} inativos
          </p>
        </div>

        {/* Total de Ciclos */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Ciclos</h3>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {allCycles.length}
          </div>
          <p className="text-sm text-gray-600">
            {allCycles.filter(c => c.status === 'OPEN').length} abertos • {allCycles.filter(c => c.status === 'CLOSED').length} fechados
          </p>
        </div>

        {/* Dias Restantes do Ciclo Ativo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Dias Restantes</h3>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          {activeCycle && activeCycle.endDate ? (
            (() => {
              const now = new Date();
              const endDate = new Date(activeCycle.endDate);
              const diffTime = endDate.getTime() - now.getTime();
              const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div>
                  <div className={`text-3xl font-bold mb-2 ${daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                    {daysRemaining > 0 ? daysRemaining : 0}
                  </div>
                  <p className="text-sm text-gray-600">
                    {daysRemaining > 0 ? 
                      `Para terminar o ciclo ${activeCycle.name}` : 
                      'Ciclo já deveria ter terminado'
                    }
                  </p>
                  {daysRemaining <= 0 && (
                    <div className="mt-2 flex items-center text-red-600 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Ciclo em atraso
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-4">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Sem deadline definida</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gerenciamento de Usuários */}
        <Link to="/admin/users" className="group">
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 group-hover:border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm text-gray-500">Gerenciar</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gerenciamento de Usuários
            </h3>
            <p className="text-gray-600 text-sm">
              Criar, editar e gerenciar usuários do sistema. Controle de permissões e roles.
            </p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Ver usuários
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Gerenciamento de Ciclos */}
        <Link to="/admin/cycles" className="group">
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 group-hover:border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm text-gray-500">Administrar</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ciclos de Avaliação
            </h3>
            <p className="text-gray-600 text-sm">
              Criar ciclos, alterar fases e status. Controle total sobre o processo de avaliação.
            </p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              Gerenciar ciclos
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Controle de Fases */}
        <Link to="/admin/phase-control" className="group">
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 group-hover:border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm text-gray-500">Avançado</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Controle de Fases
            </h3>
            <p className="text-gray-600 text-sm">
              Avançar fases independente de deadlines. Controle emergencial do ciclo.
            </p>
            <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
              Controlar fases
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Relatórios e Analytics */}
        <Link to="/admin/reports" className="group">
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 group-hover:border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm text-gray-500">Analítico</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Relatórios Administrativos
            </h3>
            <p className="text-gray-600 text-sm">
              Relatórios completos do sistema, analytics e monitoramento de performance.
            </p>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
              Ver relatórios
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Audit Log */}
        <Link to="/admin/audit-log" className="group">
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 group-hover:border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-sm text-gray-500">Auditoria</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Log de Auditoria
            </h3>
            <p className="text-gray-600 text-sm">
              Visualize todas as ações realizadas no sistema. Histórico completo de auditoria.
            </p>
            <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
              Ver logs
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminHomePage; 