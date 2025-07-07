import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AdminService, { type UserWithEvaluationProgress, type CycleData } from '../../services/AdminService';
import HRService from '../../services/HRService';
import { 
  BarChart3, 
  RefreshCw, 
  Download,
  Users,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: { [key: string]: number };
  usersByBusinessUnit: { [key: string]: number };
  usersBySeniority: { [key: string]: number };
  usersWithEvaluationProgress: UserWithEvaluationProgress[];
  totalCycles: number;
  activeCycles: number;
  closedCycles: number;
}

const AdminReports: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState<CycleData | null>(null);
  
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [
        users,
        usersWithProgress,
        cycles,
        activeCycleData
      ] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getAllUsersWithEvaluationProgress(),
        AdminService.getAllCycles(),
        AdminService.getActiveCycle().catch(() => null)
      ]);

      // Calcular métricas
      const activeUsers = users.filter(u => u.isActive).length;
      const inactiveUsers = users.filter(u => !u.isActive).length;

      // Agrupar por role
      const usersByRole: { [key: string]: number } = {};
      users.forEach(user => {
        user.roles.forEach(role => {
          usersByRole[role] = (usersByRole[role] || 0) + 1;
        });
      });

      // Agrupar por unidade de negócio
      const usersByBusinessUnit: { [key: string]: number } = {};
      users.forEach(user => {
        usersByBusinessUnit[user.businessUnit] = (usersByBusinessUnit[user.businessUnit] || 0) + 1;
      });

      // Agrupar por senioridade
      const usersBySeniority: { [key: string]: number } = {};
      users.forEach(user => {
        usersBySeniority[user.seniority] = (usersBySeniority[user.seniority] || 0) + 1;
      });

      const activeCycles = cycles.filter(c => c.status === 'OPEN').length;
      const closedCycles = cycles.filter(c => c.status === 'CLOSED').length;

      const calculatedMetrics: SystemMetrics = {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        usersByRole,
        usersByBusinessUnit,
        usersBySeniority,
        usersWithEvaluationProgress: usersWithProgress,
        totalCycles: cycles.length,
        activeCycles,
        closedCycles
      };

      setMetrics(calculatedMetrics);
      setActiveCycle(activeCycleData);
      
      console.log('✅ Métricas carregadas:', calculatedMetrics);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      showErrorToast('Erro ao carregar métricas do sistema');
    } finally {
      setLoading(false);
    }
  };

  const calculateEvaluationMetrics = () => {
    if (!metrics?.usersWithEvaluationProgress) return null;

    const users = metrics.usersWithEvaluationProgress;
    const totalUsers = users.length;
    
    let completedSelfAssessments = 0;
    let completedManagerAssessments = 0;
    let completedCommitteeAssessments = 0;
    let total360Assessments = 0;
    let totalMentoringAssessments = 0;
    let totalReferenceAssessments = 0;

    users.forEach(user => {
      if (user.evaluationProgress.selfAssessment.status === 'SUBMITTED') {
        completedSelfAssessments++;
      }
      if (user.evaluationProgress.managerAssessment.status === 'SUBMITTED') {
        completedManagerAssessments++;
      }
      if (user.evaluationProgress.committeeAssessment.status === 'SUBMITTED') {
        completedCommitteeAssessments++;
      }
      total360Assessments += user.evaluationProgress.assessments360Received;
      totalMentoringAssessments += user.evaluationProgress.mentoringAssessmentsReceived;
      totalReferenceAssessments += user.evaluationProgress.referenceFeedbacksReceived;
    });

    return {
      totalUsers,
      completedSelfAssessments,
      completedManagerAssessments,
      completedCommitteeAssessments,
      total360Assessments,
      totalMentoringAssessments,
      totalReferenceAssessments,
      selfAssessmentRate: totalUsers > 0 ? Math.round((completedSelfAssessments / totalUsers) * 100) : 0,
      managerAssessmentRate: totalUsers > 0 ? Math.round((completedManagerAssessments / totalUsers) * 100) : 0,
      committeeAssessmentRate: totalUsers > 0 ? Math.round((completedCommitteeAssessments / totalUsers) * 100) : 0
    };
  };

  const exportReport = () => {
    if (!metrics) return;

    const reportData = {
      generatedAt: new Date().toISOString(),
      systemMetrics: metrics,
      evaluationMetrics: calculateEvaluationMetrics(),
      activeCycle: activeCycle
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessToast('Relatório exportado com sucesso!');
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Admin',
      'rh': 'RH',
      'comite': 'Comitê',
      'gestor': 'Gestor',
      'colaborador': 'Colaborador'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar métricas</h3>
          <p className="text-gray-500 mb-6">Não foi possível carregar os dados do sistema.</p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const evaluationMetrics = calculateEvaluationMetrics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-teal-600" />
              Relatórios Administrativos
            </h1>
            <p className="text-gray-600 mt-1">
              Métricas completas do sistema e análise de performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Usuários</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {metrics.totalUsers}
          </div>
          <p className="text-sm text-gray-600">
            {metrics.activeUsers} ativos • {metrics.inactiveUsers} inativos
          </p>
        </div>

        {/* Total Cycles */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Ciclos</h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {metrics.totalCycles}
          </div>
          <p className="text-sm text-gray-600">
            {metrics.activeCycles} ativos • {metrics.closedCycles} fechados
          </p>
        </div>

        {/* Self Assessment Progress */}
        {evaluationMetrics && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Autoavaliações</h3>
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {evaluationMetrics.selfAssessmentRate}%
            </div>
            <p className="text-sm text-gray-600">
              {evaluationMetrics.completedSelfAssessments} de {evaluationMetrics.totalUsers} concluídas
            </p>
          </div>
        )}

        {/* Manager Assessment Progress */}
        {evaluationMetrics && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Avaliações Gestor</h3>
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {evaluationMetrics.managerAssessmentRate}%
            </div>
            <p className="text-sm text-gray-600">
              {evaluationMetrics.completedManagerAssessments} de {evaluationMetrics.totalUsers} concluídas
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Users by Role */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição por Role</h3>
          <div className="space-y-4">
            {Object.entries(metrics.usersByRole).map(([role, count]) => {
              const percentage = Math.round((count / metrics.totalUsers) * 100);
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{getRoleLabel(role)}</span>
                    <span className="text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by Business Unit */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição por Unidade</h3>
          <div className="space-y-4">
            {Object.entries(metrics.usersByBusinessUnit).map(([unit, count]) => {
              const percentage = Math.round((count / metrics.totalUsers) * 100);
              return (
                <div key={unit}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{unit}</span>
                    <span className="text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Evaluation Progress Details */}
      {evaluationMetrics && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Progresso Detalhado das Avaliações</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Self Assessments */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - evaluationMetrics.selfAssessmentRate / 100)}`}
                    className="text-green-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">
                    {evaluationMetrics.selfAssessmentRate}%
                  </span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Autoavaliações</h4>
              <p className="text-sm text-gray-600">
                {evaluationMetrics.completedSelfAssessments}/{evaluationMetrics.totalUsers}
              </p>
            </div>

            {/* Manager Assessments */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - evaluationMetrics.managerAssessmentRate / 100)}`}
                    className="text-orange-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-600">
                    {evaluationMetrics.managerAssessmentRate}%
                  </span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Gestores</h4>
              <p className="text-sm text-gray-600">
                {evaluationMetrics.completedManagerAssessments}/{evaluationMetrics.totalUsers}
              </p>
            </div>

            {/* Committee Assessments */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - evaluationMetrics.committeeAssessmentRate / 100)}`}
                    className="text-purple-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">
                    {evaluationMetrics.committeeAssessmentRate}%
                  </span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Comitê</h4>
              <p className="text-sm text-gray-600">
                {evaluationMetrics.completedCommitteeAssessments}/{evaluationMetrics.totalUsers}
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {evaluationMetrics.total360Assessments}
              </div>
              <p className="text-sm text-gray-600">Avaliações 360° Totais</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {evaluationMetrics.totalMentoringAssessments}
              </div>
              <p className="text-sm text-gray-600">Avaliações de Mentoring</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {evaluationMetrics.totalReferenceAssessments}
              </div>
              <p className="text-sm text-gray-600">Feedbacks de Referência</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Cycle Info */}
      {activeCycle && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações do Ciclo Ativo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Nome do Ciclo</h4>
              <p className="text-lg font-bold text-gray-900">{activeCycle.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Status</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {activeCycle.status}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Fase Atual</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeCycle.phase}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Data de Início</h4>
              <p className="text-sm text-gray-900">
                {activeCycle.startDate ? new Date(activeCycle.startDate).toLocaleDateString('pt-BR') : 'Não definida'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Data de Término</h4>
              <p className="text-sm text-gray-900">
                {activeCycle.endDate ? new Date(activeCycle.endDate).toLocaleDateString('pt-BR') : 'Não definida'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports; 