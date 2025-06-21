import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthProvider';
import HRService, { type HRDashboardResponse } from '../../services/HRService';
import { useGlobalToast } from '../../hooks/useGlobalToast';

const HRHomePage = () => {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<HRDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { error: showToast } = useGlobalToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getHRDashboardWithRealData();
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard RH:', err);
      setError('Erro ao carregar dados do dashboard');
      showToast('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
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

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-600 mb-4">Erro ao carregar dashboard</div>
        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {auth.user?.name?.split(' ')[0] || 'RH'}
            </h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o progresso das avaliações em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">CN</span>
          </div>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Preenchimento de avaliação */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Preenchimento de avaliação</h3>
            <div className="text-xs text-gray-500">
              {dashboardData.metrics.evaluationsCompleted} de {dashboardData.metrics.totalCollaborators} colaboradores responderam suas avaliações
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {dashboardData.metrics.cycleProgress}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardData.metrics.cycleProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - dashboardData.metrics.cycleProgress / 100)}`}
                    className="text-teal-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-teal-600">
                    {dashboardData.metrics.cycleProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avaliações pendentes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Avaliações pendentes</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {dashboardData.metrics.evaluationsPending}
          </div>
          <p className="text-sm text-gray-600">
            avaliações estão em aberto, precisam ser fechadas antes do fechamento do ciclo
          </p>
        </div>

        {/* Fechamento de ciclo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Fechamento de ciclo</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            30
          </div>
          <p className="text-sm text-gray-600">
            dias restantes para o fechamento do ciclo, de 04/06 até 30/06/2025
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Colaboradores */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
              <Link 
                to="/rh/colaboradores"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Ver mais
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.collaborators.map((collaborator) => (
              <div key={collaborator.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {collaborator.initials}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {collaborator.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {collaborator.jobTitle}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collaborator.status === 'FINALIZADO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {collaborator.status === 'FINALIZADO' ? 'Finalizado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Preenchimento por Área */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Preenchimento</h2>
              <div className="text-sm text-gray-500">Todas as áreas</div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.businessUnits.map((unit, index) => {
                const colors = ['bg-teal-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={unit.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{unit.name}</span>
                      <span className="text-sm text-gray-500">{Math.min(unit.progressPercentage, 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${color}`}
                        style={{ width: `${Math.min(unit.progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRHomePage; 