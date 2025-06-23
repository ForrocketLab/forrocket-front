import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthProvider';
import HRService, { type HRDashboardResponse, type BusinessUnitProgress } from '../../services/HRService';
import { useGlobalToast } from '../../hooks/useGlobalToast';

const HRHomePage = () => {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<HRDashboardResponse | null>(null);
  const [cycleDetails, setCycleDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados do dashboard e detalhes do ciclo em paralelo
      const [data, cycleInfo] = await Promise.all([
        HRService.getHRDashboardWithRealData(),
        HRService.getActiveCycleWithDeadlines().catch(() => null) // Não falhar se não conseguir buscar deadlines
      ]);
      
      setDashboardData(data);
      setCycleDetails(cycleInfo);
    } catch (err) {
      console.error('Erro ao carregar dashboard RH:', err);
      setError('Erro ao carregar dados do dashboard');
      showErrorToast('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar dados baseado na unidade selecionada
  const getFilteredBusinessUnits = (): BusinessUnitProgress[] => {
    if (!dashboardData) return [];
    
    if (selectedUnit === 'all') {
      return dashboardData.businessUnits;
    }
    
    return dashboardData.businessUnits.filter(unit => unit.name === selectedUnit);
  };

  // Calcular métricas filtradas
  const getFilteredMetrics = () => {
    if (!dashboardData) return null;
    
    const filteredUnits = getFilteredBusinessUnits();
    const totalCollaborators = filteredUnits.reduce((sum, unit) => sum + unit.totalCollaborators, 0);
    const evaluationsCompleted = filteredUnits.reduce((sum, unit) => sum + unit.completedEvaluations, 0);
    const evaluationsPending = totalCollaborators - evaluationsCompleted;
    const cycleProgress = totalCollaborators > 0 ? Math.round((evaluationsCompleted / totalCollaborators) * 100) : 0;
    
    return {
      totalCollaborators,
      evaluationsCompleted,
      evaluationsPending,
      cycleProgress
    };
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
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Preenchimento de avaliação */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Preenchimento de avaliação</h3>
            <div className="text-xs text-gray-500">
              {(() => {
                const metrics = getFilteredMetrics();
                return metrics ? `${metrics.evaluationsCompleted} de ${metrics.totalCollaborators} colaboradores finalizados` : 'Carregando...';
              })()}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {(() => {
                  const metrics = getFilteredMetrics();
                  return metrics ? `${metrics.cycleProgress}%` : '0%';
                })()}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getFilteredMetrics()?.cycleProgress || 0}%` }}
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
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - (getFilteredMetrics()?.cycleProgress || 0) / 100)}`}
                    className="text-teal-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-teal-600">
                    {getFilteredMetrics()?.cycleProgress || 0}%
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
            {getFilteredMetrics()?.evaluationsPending || 0}
          </div>
          <p className="text-sm text-gray-600">
            avaliações estão em aberto, precisam ser fechadas antes do fechamento do ciclo
          </p>
        </div>

        {/* Fechamento de ciclo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Fechamento de ciclo</h3>
            <div className={`p-2 rounded-lg ${(() => {
              if (!cycleDetails?.deadlinesInfo?.deadlines?.length) return 'bg-gray-100';
              const urgentCount = cycleDetails.deadlinesInfo.summary?.urgentCount || 0;
              const overdueCount = cycleDetails.deadlinesInfo.summary?.overdueCount || 0;
              if (overdueCount > 0) return 'bg-red-100';
              if (urgentCount > 0) return 'bg-yellow-100';
              return 'bg-green-100';
            })()}`}>
              <svg className={`w-5 h-5 ${(() => {
                if (!cycleDetails?.deadlinesInfo?.deadlines?.length) return 'text-gray-600';
                const urgentCount = cycleDetails.deadlinesInfo.summary?.urgentCount || 0;
                const overdueCount = cycleDetails.deadlinesInfo.summary?.overdueCount || 0;
                if (overdueCount > 0) return 'text-red-600';
                if (urgentCount > 0) return 'text-yellow-600';
                return 'text-green-600';
              })()}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className={`text-3xl font-bold mb-2 ${(() => {
            if (!cycleDetails?.deadlinesInfo?.deadlines?.length) return 'text-gray-600';
            const urgentCount = cycleDetails.deadlinesInfo.summary?.urgentCount || 0;
            const overdueCount = cycleDetails.deadlinesInfo.summary?.overdueCount || 0;
            if (overdueCount > 0) return 'text-red-600';
            if (urgentCount > 0) return 'text-yellow-600';
            return 'text-green-600';
          })()}`}>
            {(() => {
              // Usar dados de deadline mais precisos se disponíveis
              if (cycleDetails?.deadlinesInfo?.deadlines?.length) {
                const nextDeadline = cycleDetails.deadlinesInfo.deadlines
                  .filter((d: any) => d.daysUntil > 0)
                  .sort((a: any, b: any) => a.daysUntil - b.daysUntil)[0];
                
                if (nextDeadline) {
                  return nextDeadline.daysUntil;
                }
              }
              
              // Fallback para data de fim do ciclo
              if (dashboardData.activeCycle.endDate) {
                const endDate = new Date(dashboardData.activeCycle.endDate);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return Math.max(0, diffDays);
              }
              return 'N/A';
            })()}
          </div>
          <p className="text-sm text-gray-600">
            {(() => {
              // Mostrar próxima deadline se disponível
              if (cycleDetails?.deadlinesInfo?.deadlines?.length) {
                const nextDeadline = cycleDetails.deadlinesInfo.deadlines
                  .filter((d: any) => d.daysUntil > 0)
                  .sort((a: any, b: any) => a.daysUntil - b.daysUntil)[0];
                
                if (nextDeadline) {
                  return `dias para ${nextDeadline.name.toLowerCase()} do ciclo ${dashboardData.activeCycle.name}`;
                }
                
                // Se não há próximas deadlines, mostrar status
                const overdueCount = cycleDetails.deadlinesInfo.summary?.overdueCount || 0;
                if (overdueCount > 0) {
                  return `${overdueCount} deadline(s) em atraso no ciclo ${dashboardData.activeCycle.name}`;
                }
                
                return `Todas as deadlines do ciclo ${dashboardData.activeCycle.name} foram cumpridas`;
              }
              
              // Fallback
              if (dashboardData.activeCycle.endDate) {
                return (
                  <>
                    dias restantes para o fechamento do ciclo{' '}
                    <strong>{dashboardData.activeCycle.name}</strong>
                    {dashboardData.activeCycle.startDate && (
                      <> (até {new Date(dashboardData.activeCycle.endDate).toLocaleDateString('pt-BR')})</>
                    )}
                  </>
                );
              }
              
              return 'Informações de deadline não disponíveis';
            })()}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Preenchimento por Unidade</h2>
              <div className="text-sm text-gray-500">
                {selectedUnit === 'all' ? 'Todas as áreas' : selectedUnit}
              </div>
            </div>
            
            {/* Filtro por Unidade */}
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unidade de Negócio
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Todas as unidades</option>
                {dashboardData.businessUnits.map(unit => (
                  <option key={unit.name} value={unit.name}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {getFilteredBusinessUnits().map((unit, index) => {
                const totalHeight = 40; // altura total da barra em pixels
                const completedWidth = (unit.completedEvaluations / unit.totalCollaborators) * 100;
                const pendingWidth = 100 - completedWidth;
                
                return (
                  <div key={unit.name} className="space-y-3">
                    {/* Header da unidade */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{unit.name}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {unit.totalCollaborators} colaborador{unit.totalCollaborators !== 1 ? 'es' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {Math.round(unit.progressPercentage)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {unit.completedEvaluations}/{unit.totalCollaborators}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso stacked */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-lg h-8 overflow-hidden">
                        <div className="h-full flex">
                          {/* Parte finalizada */}
                          <div
                            className="bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center transition-all duration-500"
                            style={{ width: `${completedWidth}%` }}
                          >
                            {unit.completedEvaluations > 0 && completedWidth > 15 && (
                              <span className="text-xs font-medium text-white">
                                {unit.completedEvaluations}
                              </span>
                            )}
                          </div>
                          
                          {/* Parte pendente */}
                          <div
                            className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center transition-all duration-500"
                            style={{ width: `${pendingWidth}%` }}
                          >
                            {(unit.totalCollaborators - unit.completedEvaluations) > 0 && pendingWidth > 15 && (
                              <span className="text-xs font-medium text-white">
                                {unit.totalCollaborators - unit.completedEvaluations}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Labels detalhadas */}
                      <div className="flex justify-between mt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-teal-500 rounded mr-1"></div>
                            <span className="text-gray-600">
                              {unit.completedEvaluations} finalizadas
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                            <span className="text-gray-600">
                              {unit.totalCollaborators - unit.completedEvaluations} pendentes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {getFilteredBusinessUnits().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma unidade encontrada com os filtros selecionados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRHomePage; 