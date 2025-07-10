import React, { useState, useEffect } from 'react';
import {
  FileText,
  Database,
  Clock,
  User,
  RefreshCw,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AuditService, {
  type AuditLogMetrics,
  type AuditLogEntry,
  type HourlyApiCalls,
  type TopApiEndpoint,
} from '../../services/AuditService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AuditLogPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AuditLogMetrics | null>(null);
  const [logEntries, setLogEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  const [hourlyApiCalls, setHourlyApiCalls] = useState<HourlyApiCalls[]>([]);
  const [topApiEndpoints, setTopApiEndpoints] = useState<TopApiEndpoint[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLogEntries();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, entriesData, hourlyData, topEndpointsData] =
        await Promise.all([
          AuditService.getAuditLogMetrics(),
          AuditService.getRecentLogEntries({ limit: 10 }),
          AuditService.getHourlyApiCalls(1),
          AuditService.getTopApiEndpoints(),
        ]);

      setMetrics(metricsData);
      setLogEntries(Array.isArray(entriesData) ? entriesData : []);
      setHourlyApiCalls(Array.isArray(hourlyData) ? hourlyData : []);
      setTopApiEndpoints(Array.isArray(topEndpointsData) ? topEndpointsData : []);

      showSuccessToast('Dados de auditoria atualizados!');
    } catch (err) {
      console.error('Erro ao carregar dados de auditoria:', err);
      setError('Erro ao carregar dados de auditoria.');
      showErrorToast('Erro ao carregar dados de auditoria');
      setHourlyApiCalls([]);
      setTopApiEndpoints([]);
      setLogEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLogEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const entriesData = await AuditService.getRecentLogEntries({
        search: searchTerm,
        limit: 20,
      });
      setLogEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Erro ao carregar logs.');
      showErrorToast('Erro ao carregar logs');
      setLogEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };



  const topEndpointsChartData = topApiEndpoints.map((item) => ({
    endpoint: item.endpoint,
    count: item.count,
  }));

  if (
    loading &&
    !metrics &&
    hourlyApiCalls.length === 0 &&
    topApiEndpoints.length === 0 &&
    logEntries.length === 0
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="h-12 w-12" />
        <span className="ml-3 text-gray-600">Carregando logs de auditoria...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar logs
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
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
              <FileText className="h-7 w-7 text-teal-600" />
              Audit Log
            </h1>
            <p className="text-gray-600 mt-1">
              Registros de auditoria e logs do sistema - Monitoramento de atividades e requisições
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Logs</h3>
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{metrics?.totalLogs || 0}</div>
          <p className="text-sm text-gray-500">Registros no sistema</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Logs Hoje</h3>
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{metrics?.dailyLogs || 0}</div>
          <p className="text-sm text-gray-500">Nas últimas 24h</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Usuários Ativos (Logs)</h3>
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{metrics?.activeUsers || 0}</div>
          <p className="text-sm text-gray-500">Com atividade recente</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Requisições Logadas</h3>
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{metrics?.totalApiCalls || 0}</div>
          <p className="text-sm text-gray-500">API calls registradas</p>
        </div>
      </div>

      {/* Gráfico Top Endpoints */}
      <div className="mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Endpoints de API</h2>
          {topApiEndpoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topEndpointsChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="endpoint" width={200} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Número de Chamadas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Nenhum dado de top endpoints disponível.</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário, ação, detalhes ou IP..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Logs de Atividade Recente</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP de Origem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logEntries.length > 0 ? (
                logEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {entry.userName || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.userId || 'Sistema'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.eventType === 'API_CALL' &&
                      entry.details?.endpoint?.toLowerCase().includes('export')
                        ? 'Exportação (API Call)'
                        : entry.eventType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {entry.eventType === 'API_CALL' && entry.details
                        ? `Endpoint: ${entry.details.endpoint}, Método: ${entry.details.method}, Status: ${entry.details.statusCode}`
                        : typeof entry.details === 'object' && entry.details !== null
                        ? JSON.stringify(entry.details)
                        : entry.details || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.originIp || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Nenhum log encontrado com os critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
