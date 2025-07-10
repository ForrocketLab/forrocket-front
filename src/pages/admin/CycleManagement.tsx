import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AdminService, { 
  type CycleData, 
  type CreateCycleData,
  type ActivateCycleData,
  type UpdateCycleStatusData
} from '../../services/AdminService';
import { formatDate, formatDateTime, formatDateTimeDetailed, debugFormatDate } from '../../utils/dateUtils';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  Play,
  Edit,
  Eye,
  AlertTriangle,
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

  // Estados para modal de visualização
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCycleForView, setSelectedCycleForView] = useState<CycleData | null>(null);

  // Estados para modal de fechar ciclo
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedCycleForClose, setSelectedCycleForClose] = useState<CycleData | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [confirmCloseText, setConfirmCloseText] = useState('');

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

  const handleActivateCycle = async () => {
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

  const openViewModal = (cycle: CycleData) => {
    setSelectedCycleForView(cycle);
    setShowViewModal(true);
  };

  const openCloseModal = (cycle: CycleData) => {
    setSelectedCycleForClose(cycle);
    setConfirmCloseText('');
    setShowCloseModal(true);
  };

  const handleCloseCycle = async () => {
    if (!selectedCycleForClose || confirmCloseText !== selectedCycleForClose.name) return;

    try {
      setCloseLoading(true);
      await handleUpdateCycleStatus(selectedCycleForClose.id, 'CLOSED');
      setShowCloseModal(false);
      setSelectedCycleForClose(null);
      setConfirmCloseText('');
    } catch (error) {
      console.error('Erro ao fechar ciclo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao fechar ciclo');
    } finally {
      setCloseLoading(false);
    }
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
                <span>Data de Início: {debugFormatDate(activeCycle.startDate)}</span>
                <span>Data de Término: {debugFormatDate(activeCycle.endDate)}</span>
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
                    <div>Início: {debugFormatDate(cycle.startDate)}</div>
                    <div>Fim: {debugFormatDate(cycle.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Avaliações: {debugFormatDate(cycle.assessmentDeadline)}</div>
                    <div>Gestores: {debugFormatDate(cycle.managerDeadline)}</div>
                    <div>Equalização: {debugFormatDate(cycle.equalizationDeadline)}</div>
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
                        <button
                          onClick={() => openCloseModal(cycle)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-sm font-medium border border-red-300 transition-colors"
                          title="⚠️ FECHAR CICLO (IRREVERSÍVEL)"
                        >
                          FECHAR CICLO
                        </button>
                      )}
                      
                      <button 
                        onClick={() => openViewModal(cycle)}
                        className="text-teal-600 hover:text-teal-900 p-1" 
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
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
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Play className="h-6 w-6 text-green-600" />
                Ativar Ciclo: {selectedCycleForActivation.name}
              </h2>
              <button
                onClick={() => setShowActivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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

              {/* Informações do Ciclo a ser Ativado */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-4">Configuração do Ciclo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700">Período do Ciclo</label>
                    <p className="text-sm text-green-900 font-medium">
                      {formatDate(selectedCycleForActivation.startDate)} até {formatDate(selectedCycleForActivation.endDate)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Duração: {selectedCycleForActivation.startDate && selectedCycleForActivation.endDate ? 
                        Math.ceil((new Date(selectedCycleForActivation.endDate).getTime() - new Date(selectedCycleForActivation.startDate).getTime()) / (1000 * 60 * 60 * 24)) 
                        : 0} dias
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700">Status Atual</label>
                    <p className="text-sm text-green-900 font-medium">
                      {getStatusLabel(selectedCycleForActivation.status)} → <span className="text-green-600">Aberto</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Deadlines Configurados */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-4">Cronograma de Deadlines</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
                    <div>
                      <h4 className="font-medium text-blue-900">Fase 1: Avaliações</h4>
                      <p className="text-sm text-blue-700">Autoavaliação, 360°, Mentoring, Reference</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">
                        {formatDate(selectedCycleForActivation.assessmentDeadline)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
                    <div>
                      <h4 className="font-medium text-blue-900">Fase 2: Gestores</h4>
                      <p className="text-sm text-blue-700">Avaliações dos gestores</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">
                        {formatDate(selectedCycleForActivation.managerDeadline)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
                    <div>
                      <h4 className="font-medium text-blue-900">Fase 3: Equalização</h4>
                      <p className="text-sm text-blue-700">Equalização pelo comitê</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">
                        {formatDate(selectedCycleForActivation.equalizationDeadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmação */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 text-center">
                  <strong>O ciclo será ativado com as datas já configuradas.</strong><br/>
                  Após a ativação, o ciclo iniciará automaticamente na fase de avaliações.
                </p>
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
                  onClick={handleActivateCycle}
                  disabled={activateLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {activateLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {activateLoading ? 'Ativando...' : 'Ativar Ciclo com Datas Configuradas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Cycle Modal */}
      {showViewModal && selectedCycleForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="h-6 w-6 text-teal-600" />
                Detalhes do Ciclo: {selectedCycleForView.name}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nome do Ciclo</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCycleForView.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ID do Ciclo</label>
                    <p className="text-sm text-gray-700 font-mono">{selectedCycleForView.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCycleForView.status)}`}>
                        {getStatusLabel(selectedCycleForView.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fase Atual</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(selectedCycleForView.phase)}`}>
                        {getPhaseLabel(selectedCycleForView.phase)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Período do Ciclo */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Período do Ciclo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Data de Início</label>
                    <p className="text-sm text-gray-900">{formatDateTimeDetailed(selectedCycleForView.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Data de Término</label>
                    <p className="text-sm text-gray-900">{formatDateTimeDetailed(selectedCycleForView.endDate)}</p>
                  </div>
                </div>
                {selectedCycleForView.startDate && selectedCycleForView.endDate && (
                  <div className="mt-3 p-2 bg-blue-100 rounded border">
                    <p className="text-sm text-blue-800">
                      <strong>Duração:</strong> {Math.ceil((new Date(selectedCycleForView.endDate).getTime() - new Date(selectedCycleForView.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                    </p>
                  </div>
                )}
              </div>

              {/* Deadlines */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deadlines por Fase</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <h4 className="font-medium text-gray-900">Fase de Avaliações</h4>
                      <p className="text-sm text-gray-600">Autoavaliação, 360°, Mentoring, Reference</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTimeDetailed(selectedCycleForView.assessmentDeadline)}
                      </p>
                      {selectedCycleForView.assessmentDeadline && (
                        <p className={`text-xs ${new Date(selectedCycleForView.assessmentDeadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(selectedCycleForView.assessmentDeadline) < new Date() ? 'Expirado' : 'Ativo'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <h4 className="font-medium text-gray-900">Fase de Gestores</h4>
                      <p className="text-sm text-gray-600">Avaliações dos gestores</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTimeDetailed(selectedCycleForView.managerDeadline)}
                      </p>
                      {selectedCycleForView.managerDeadline && (
                        <p className={`text-xs ${new Date(selectedCycleForView.managerDeadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(selectedCycleForView.managerDeadline) < new Date() ? 'Expirado' : 'Ativo'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <h4 className="font-medium text-gray-900">Fase de Equalização</h4>
                      <p className="text-sm text-gray-600">Equalização pelo comitê</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTimeDetailed(selectedCycleForView.equalizationDeadline)}
                      </p>
                      {selectedCycleForView.equalizationDeadline && (
                        <p className={`text-xs ${new Date(selectedCycleForView.equalizationDeadline) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {new Date(selectedCycleForView.equalizationDeadline) < new Date() ? 'Expirado' : 'Ativo'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Datas de Criação e Atualização */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Auditoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Criado em</label>
                    <p className="text-gray-900">{formatDateTimeDetailed(selectedCycleForView.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Última atualização</label>
                    <p className="text-gray-900">{formatDateTimeDetailed(selectedCycleForView.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Cycle Modal */}
      {showCloseModal && selectedCycleForClose && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border-4 border-red-200">
            <div className="text-center">
              {/* Icon de Alerta */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⚠️ FECHAR CICLO
              </h2>
              
              {/* Aviso */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium leading-relaxed">
                  <strong className="block text-base mb-2">AÇÃO IRREVERSÍVEL!</strong>
                  Você está prestes a fechar o ciclo <strong>"{selectedCycleForClose.name}"</strong>. 
                  Esta ação NÃO PODE ser desfeita e o ciclo não poderá ser reaberto.
                </p>
              </div>

              {/* Informações do Ciclo */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Detalhes do Ciclo:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Nome:</strong> {selectedCycleForClose.name}</p>
                  <p><strong>Status Atual:</strong> {getStatusLabel(selectedCycleForClose.status)}</p>
                  <p><strong>Fase:</strong> {getPhaseLabel(selectedCycleForClose.phase)}</p>
                  <p><strong>Período:</strong> {formatDate(selectedCycleForClose.startDate)} até {formatDate(selectedCycleForClose.endDate)}</p>
                </div>
              </div>
              
              {/* Confirmação */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Para confirmar, digite o nome do ciclo: <strong>{selectedCycleForClose.name}</strong>
                </label>
                <input
                  type="text"
                  value={confirmCloseText}
                  onChange={(e) => setConfirmCloseText(e.target.value)}
                  placeholder={`Digite "${selectedCycleForClose.name}" para confirmar`}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-medium"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false);
                    setSelectedCycleForClose(null);
                    setConfirmCloseText('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseCycle}
                  disabled={closeLoading || confirmCloseText !== selectedCycleForClose.name}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {closeLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {closeLoading ? 'Fechando...' : 'FECHAR CICLO'}
                </button>
              </div>

              {/* Texto de Segurança */}
              <p className="text-xs text-gray-500 mt-4">
                Esta ação fechará permanentemente o ciclo e não poderá ser revertida.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleManagement; 