import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AdminService, { 
  type CycleData, 
  type CreateCycleData,
  type ActivateCycleData,
  type UpdateCycleStatusData
} from '../../services/AdminService';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  Play,
  Pause,
  Square,
  Edit,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

const CycleManagement: React.FC = () => {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [activeCycle, setActiveCycle] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para modal de criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateCycleData>({
    name: '',
    startDate: '',
    endDate: '',
    assessmentDeadline: '',
    managerDeadline: '',
    equalizationDeadline: ''
  });

  // Estados para modal de ativação
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCycleForActivation, setSelectedCycleForActivation] = useState<CycleData | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateFormData, setActivateFormData] = useState<ActivateCycleData>({
    startDate: '',
    endDate: '',
    assessmentDeadline: '',
    managerDeadline: '',
    equalizationDeadline: '',
    autoSetEndDate: true
  });

  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const [cyclesData, activeCycleData] = await Promise.all([
        AdminService.getAllCycles(),
        AdminService.getActiveCycle().catch(() => null)
      ]);
      
      console.log('✅ Ciclos carregados:', cyclesData.length);
      setCycles(cyclesData);
      setActiveCycle(activeCycleData);
    } catch (error) {
      console.error('Erro ao carregar ciclos:', error);
      showErrorToast('Erro ao carregar ciclos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const newCycle = await AdminService.createCycle(createFormData);
      console.log('✅ Ciclo criado:', newCycle);
      
      // Atualizar lista de ciclos
      setCycles(prev => [newCycle, ...prev]);
      
      // Limpar formulário e fechar modal
      setCreateFormData({
        name: '',
        startDate: '',
        endDate: '',
        assessmentDeadline: '',
        managerDeadline: '',
        equalizationDeadline: ''
      });
      setShowCreateModal(false);
      showSuccessToast('Ciclo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao criar ciclo');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleActivateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleForActivation) return;

    try {
      setActivateLoading(true);
      const updatedCycle = await AdminService.activateCycle(selectedCycleForActivation.id, activateFormData);
      console.log('✅ Ciclo ativado:', updatedCycle);
      
      // Atualizar listas
      setCycles(prev => prev.map(c => c.id === updatedCycle.id ? updatedCycle : { ...c, status: c.status === 'OPEN' ? 'CLOSED' : c.status }));
      setActiveCycle(updatedCycle);
      
      // Fechar modal
      setShowActivateModal(false);
      setSelectedCycleForActivation(null);
      showSuccessToast('Ciclo ativado com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar ciclo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao ativar ciclo');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleUpdateCycleStatus = async (cycleId: string, status: UpdateCycleStatusData['status']) => {
    try {
      const updatedCycle = await AdminService.updateCycleStatus(cycleId, { status });
      console.log('✅ Status do ciclo atualizado:', updatedCycle);
      
      // Atualizar lista
      setCycles(prev => prev.map(c => c.id === cycleId ? updatedCycle : c));
      if (activeCycle?.id === cycleId) {
        setActiveCycle(updatedCycle);
      }
      
      showSuccessToast(`Status do ciclo alterado para ${getStatusLabel(status)}`);
    } catch (error) {
      console.error('Erro ao atualizar status do ciclo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao atualizar status do ciclo');
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Aberto';
      case 'UPCOMING': return 'Futuro';
      case 'EQUALIZATION': return 'Equalização';
      case 'CLOSED': return 'Fechado';
      default: return status;
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const openActivateModal = (cycle: CycleData) => {
    setSelectedCycleForActivation(cycle);
    setActivateFormData({
      startDate: cycle.startDate || '',
      endDate: cycle.endDate || '',
      assessmentDeadline: cycle.assessmentDeadline || '',
      managerDeadline: cycle.managerDeadline || '',
      equalizationDeadline: cycle.equalizationDeadline || '',
      autoSetEndDate: true
    });
    setShowActivateModal(true);
  };

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
              <Calendar className="h-7 w-7 text-teal-600" />
              Gerenciamento de Ciclos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os ciclos de avaliação - {cycles.length} ciclos cadastrados
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadCycles}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Ciclo
            </button>
          </div>
        </div>
      </div>

      {/* Active Cycle Card */}
      {activeCycle && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Ciclo Ativo: {activeCycle.name}</h2>
              <div className="flex gap-4 text-sm">
                <span>Status: {getStatusLabel(activeCycle.status)}</span>
                <span>Fase: {getPhaseLabel(activeCycle.phase)}</span>
                <span>Criado: {formatDate(activeCycle.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Controlar Fases
              </button>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycles Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Todos os Ciclos</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciclo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadlines
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cycle.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {cycle.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                      {getStatusLabel(cycle.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(cycle.phase)}`}>
                      {getPhaseLabel(cycle.phase)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Início: {formatDate(cycle.startDate)}</div>
                    <div>Fim: {formatDate(cycle.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Avaliações: {formatDate(cycle.assessmentDeadline)}</div>
                    <div>Gestores: {formatDate(cycle.managerDeadline)}</div>
                    <div>Equalização: {formatDate(cycle.equalizationDeadline)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {cycle.status === 'UPCOMING' && (
                        <button
                          onClick={() => openActivateModal(cycle)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Ativar ciclo"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      
                      {cycle.status === 'OPEN' && (
                        <>
                          <button
                            onClick={() => handleUpdateCycleStatus(cycle.id, 'EQUALIZATION')}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Mover para equalização"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateCycleStatus(cycle.id, 'CLOSED')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Fechar ciclo"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button className="text-teal-600 hover:text-teal-900 p-1" title="Ver detalhes">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cycles.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ciclo encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crie o primeiro ciclo de avaliação.
            </p>
          </div>
        )}
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Criar Novo Ciclo</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Nome do Ciclo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Ciclo *
                  </label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: 2025.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Datas do Ciclo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input
                      type="datetime-local"
                      value={createFormData.startDate}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim
                    </label>
                    <input
                      type="datetime-local"
                      value={createFormData.endDate}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Deadlines */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Deadlines (Opcional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Avaliações
                      </label>
                      <input
                        type="datetime-local"
                        value={createFormData.assessmentDeadline}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, assessmentDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Gestores
                      </label>
                      <input
                        type="datetime-local"
                        value={createFormData.managerDeadline}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, managerDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Equalização
                      </label>
                      <input
                        type="datetime-local"
                        value={createFormData.equalizationDeadline}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, equalizationDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {createLoading ? 'Criando...' : 'Criar Ciclo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate Cycle Modal */}
      {showActivateModal && selectedCycleForActivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ativar Ciclo: {selectedCycleForActivation.name}
              </h2>
              <button
                onClick={() => setShowActivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleActivateCycle} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Ativar este ciclo irá automaticamente fechar o ciclo atualmente ativo (se houver).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Datas do Ciclo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input
                      type="datetime-local"
                      value={activateFormData.startDate}
                      onChange={(e) => setActivateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim
                    </label>
                    <input
                      type="datetime-local"
                      value={activateFormData.endDate}
                      onChange={(e) => setActivateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Deadlines */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Deadlines</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Avaliações
                      </label>
                      <input
                        type="datetime-local"
                        value={activateFormData.assessmentDeadline}
                        onChange={(e) => setActivateFormData(prev => ({ ...prev, assessmentDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Gestores
                      </label>
                      <input
                        type="datetime-local"
                        value={activateFormData.managerDeadline}
                        onChange={(e) => setActivateFormData(prev => ({ ...prev, managerDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline Equalização
                      </label>
                      <input
                        type="datetime-local"
                        value={activateFormData.equalizationDeadline}
                        onChange={(e) => setActivateFormData(prev => ({ ...prev, equalizationDeadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Set End Date */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoSetEndDate"
                    checked={activateFormData.autoSetEndDate}
                    onChange={(e) => setActivateFormData(prev => ({ ...prev, autoSetEndDate: e.target.checked }))}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoSetEndDate" className="ml-2 block text-sm text-gray-900">
                    Configurar automaticamente a data de fim com base na deadline de equalização
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={activateLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {activateLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {activateLoading ? 'Ativando...' : 'Ativar Ciclo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleManagement; 