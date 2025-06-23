import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import HRService, { 
  type CollaboratorWithEvaluationProgress, 
  type CollaboratorFilters,
  type EvaluationStepProgress
} from '../../services/HRService';
import CommitteeService, { type CollaboratorEvaluationSummary } from '../../services/CommitteeService';
import { Eye, X } from 'lucide-react';

const CollaboratorManagement: React.FC = () => {
  const [collaborators, setCollaborators] = useState<CollaboratorWithEvaluationProgress[]>([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState<CollaboratorWithEvaluationProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CollaboratorFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  // Estados para o modal de notas detalhadas
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [evaluationDetails, setEvaluationDetails] = useState<CollaboratorEvaluationSummary | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Estado para fase do ciclo
  const [currentCyclePhase, setCurrentCyclePhase] = useState<{
    cycleName: string;
    currentPhase: string;
    phaseDescription: string;
  } | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [collaborators, filters, searchTerm, selectedBusinessUnit, selectedSeniority, selectedRole, showActiveOnly]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      
      // Carregar colaboradores e fase do ciclo em paralelo
      const [data, cyclePhaseData] = await Promise.all([
        HRService.getAllCollaboratorsWithEvaluationProgress(),
        HRService.getActiveCyclePhase()
      ]);
      
      console.log('✅ Colaboradores carregados:', data.length, 'em', new Date().toLocaleTimeString());
      console.log('✅ Fase do ciclo:', cyclePhaseData);
      
      setCollaborators(data);
      setCurrentCyclePhase(cyclePhaseData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      showErrorToast('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const currentFilters: CollaboratorFilters = {
      search: searchTerm,
      businessUnit: selectedBusinessUnit || undefined,
      seniority: selectedSeniority || undefined,
      roles: selectedRole ? [selectedRole] : undefined,
      isActive: showActiveOnly ? true : undefined,
    };

    const filtered = HRService.filterCollaboratorsWithProgress(collaborators, currentFilters);
    setFilteredCollaborators(filtered);
  };

  const getUniqueValues = (field: keyof CollaboratorWithEvaluationProgress) => {
    return [...new Set(collaborators.map(c => c[field]))].filter(Boolean).sort() as string[];
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'colaborador': 'Colaborador',
      'gestor': 'Gestor',
      'comite': 'Comitê',
      'rh': 'RH',
      'admin': 'Admin'
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inativo
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBusinessUnit('');
    setSelectedSeniority('');
    setSelectedRole('');
    setShowActiveOnly(true);
  };

  const getRealEvaluationProgress = (collaborator: CollaboratorWithEvaluationProgress) => {
    const steps = HRService.getEvaluationStepsFromProgress(collaborator.evaluationProgress);
    const progress = HRService.calculateEvaluationProgress(steps);
    
    return {
      ...progress,
      steps
    };
  };

  const renderProgressBar = (progress: ReturnType<typeof getRealEvaluationProgress>, index: number) => {
    const { completedSteps, totalSteps, progressPercentage, steps } = progress;
    
    let progressColor = 'bg-red-500';
    if (progressPercentage >= 80) progressColor = 'bg-green-500';
    else if (progressPercentage >= 50) progressColor = 'bg-yellow-500';
    else if (progressPercentage >= 25) progressColor = 'bg-orange-500';

    return (
      <div className="w-full relative group">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{completedSteps}/{totalSteps} etapas</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 cursor-help">
          <div 
            className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Tooltip sempre à direita para garantir visibilidade completa */}
        <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap min-w-max">
          <div className="font-semibold mb-2 text-gray-100">Etapas de Avaliação:</div>
          {steps.map((step, stepIndex) => (
            <div key={stepIndex} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${step.completed ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className={`${step.completed ? 'text-green-300' : 'text-gray-300'} text-xs`}>
                {step.name}
                {step.count !== undefined && step.count > 0 && ` (${step.count})`}
              </span>
              {step.completed && <span className="text-green-300 text-xs ml-1">✓</span>}
            </div>
          ))}
          {/* Seta do tooltip apontando para a esquerda */}
          <div className="absolute right-full top-3 border-4 border-transparent border-r-gray-800"></div>
        </div>
      </div>
    );
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Limpa o cache e força refresh dos dados
      HRService.clearCache();
      const data = await HRService.refreshCollaboratorsData();
      console.log('🔄 Dados atualizados:', data.length, 'em', new Date().toLocaleTimeString());
      setCollaborators(data);
      setLastUpdated(new Date());
      showSuccessToast('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showErrorToast('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de notas detalhadas
  const handleViewScores = async (collaboratorId: string) => {
    setSelectedCollaboratorId(collaboratorId);
    setShowScoresModal(true);
    setLoadingDetails(true);
    setEvaluationDetails(null);

    try {
      console.log('🔍 Buscando detalhes para colaborador:', collaboratorId);
      const details = await HRService.getCollaboratorEvaluationDetails(collaboratorId);
      console.log('✅ Detalhes carregados:', details);
      setEvaluationDetails(details);
    } catch (error: any) {
      console.error('❌ Erro ao carregar detalhes das avaliações:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Erro desconhecido';
      console.log('📋 Mensagem de erro detalhada:', errorMessage);
      
      showErrorToast(`Erro: ${errorMessage}`);
      
      // Definir dados de fallback para mostrar no modal
      setEvaluationDetails({
        cycle: 'Ciclo Atual',
        collaborator: {
          id: collaboratorId,
          name: 'Colaborador não encontrado',
          email: 'N/A',
          jobTitle: 'N/A',
          seniority: 'N/A'
        },
        evaluationScores: {
          selfAssessment: null,
          assessment360: null,
          managerAssessment: null,
          mentoring: null
        },
        customSummary: `Erro ao carregar dados: ${errorMessage}. O ciclo pode não estar na fase de equalização ou o colaborador pode não ter avaliações.`,
        selfAssessment: null,
        assessments360Received: [],
        managerAssessmentsReceived: [],
        mentoringAssessmentsReceived: [],
        referenceFeedbacksReceived: [],
        committeeAssessment: null,
        summary: {
          totalAssessmentsReceived: 0,
          hasCommitteeAssessment: false,
          isEqualizationComplete: false,
        }
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowScoresModal(false);
    setSelectedCollaboratorId(null);
    setEvaluationDetails(null);
  };

  // Função para renderizar barra de nota
  const renderScoreBar = (score: number | null, label: string) => {
    const percentage = score ? (score / 5) * 100 : 0;
    const color = score 
      ? score >= 4 ? 'bg-green-500' 
        : score >= 3 ? 'bg-yellow-500' 
        : 'bg-red-500'
      : 'bg-gray-300';

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">
            {score ? score.toFixed(1) : 'N/A'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Colaboradores</h1>
            <p className="text-gray-600 mt-1">Gerencie colaboradores e acompanhe o progresso das avaliações</p>
            
            {/* Indicador da Fase Atual do Ciclo */}
            {currentCyclePhase && (
              <div className="flex items-center gap-2 mt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-900">
                    Ciclo: {currentCyclePhase.cycleName}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-900">
                    Fase: {currentCyclePhase.phaseDescription}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium rounded-lg hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Busca */}
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nome ou email
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Unidade de Negócio */}
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Negócio
              </label>
              <select
                value={selectedBusinessUnit}
                onChange={(e) => setSelectedBusinessUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {getUniqueValues('businessUnit').map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Senioridade */}
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senioridade
              </label>
              <select
                value={selectedSeniority}
                onChange={(e) => setSelectedSeniority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {getUniqueValues('seniority').map(seniority => (
                  <option key={seniority} value={seniority}>{seniority}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="colaborador">Colaborador</option>
                <option value="gestor">Gestor</option>
                <option value="comite">Comitê</option>
                <option value="rh">RH</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Apenas colaboradores ativos</span>
              </label>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total de Colaboradores</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredCollaborators.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Colaboradores Ativos</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {filteredCollaborators.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Avaliações Concluídas</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {filteredCollaborators.filter(c => 
                c.evaluationProgress.committeeAssessment.status === 'SUBMITTED'
              ).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              }) : 'Carregando...'}
            </p>
            <p className="text-xs text-gray-500">
              {lastUpdated ? lastUpdated.toLocaleDateString('pt-BR') : ''}
            </p>
          </div>
        </div>

        {/* Tabela de Colaboradores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="min-w-full">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Unidade
                  </th>
                  <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Gestor
                  </th>
                  <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Mentor
                  </th>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCollaborators.map((collaborator, index) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-teal-800">
                              {collaborator.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {collaborator.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {collaborator.email}
                          </div>
                          {/* Mostrar funções em telas pequenas */}
                          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
                            {collaborator.roles.slice(0, 2).map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {getRoleDisplayName(role)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 truncate">{collaborator.jobTitle}</div>
                      <div className="text-sm text-gray-500 truncate">{collaborator.seniority}</div>
                      {/* Mostrar unidade em telas pequenas */}
                      <div className="text-xs text-gray-400 truncate lg:hidden mt-1">
                        {collaborator.businessUnit}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-900 truncate">{collaborator.businessUnit}</div>
                      <div className="text-sm text-gray-500 truncate">{collaborator.careerTrack}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 truncate hidden xl:table-cell">
                      {collaborator.managerName || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 truncate hidden xl:table-cell">
                      {collaborator.mentorName || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-full">
                        {renderProgressBar(getRealEvaluationProgress(collaborator), index)}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {getStatusBadge(collaborator.isActive)}
                      {/* Mostrar gestor e mentor em telas médias */}
                      <div className="text-xs text-gray-500 mt-1 xl:hidden truncate">
                        Gestor: {collaborator.managerName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 xl:hidden truncate">
                        Mentor: {collaborator.mentorName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewScores(collaborator.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                        title="Ver notas detalhadas"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">Ver Notas</span>
                        <span className="sm:hidden">Notas</span>
                      </button>
                      {/* Mostrar status em telas pequenas */}
                      <div className="mt-1 md:hidden">
                        {getStatusBadge(collaborator.isActive)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCollaborators.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Nenhum colaborador encontrado</div>
              <p className="text-gray-400">Tente ajustar os filtros para encontrar colaboradores.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Notas Detalhadas */}
      {showScoresModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Notas Detalhadas - {evaluationDetails?.collaborator?.name || 'Carregando...'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <p className="ml-4 text-gray-700">Carregando detalhes das avaliações...</p>
                </div>
              ) : evaluationDetails ? (
                <div className="space-y-6">
                  {/* Informações do Colaborador */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informações do Colaborador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Email:</p>
                        <p className="font-medium">{evaluationDetails.collaborator.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cargo:</p>
                        <p className="font-medium">{evaluationDetails.collaborator.jobTitle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Senioridade:</p>
                        <p className="font-medium">{evaluationDetails.collaborator.seniority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ciclo:</p>
                        <p className="font-medium">{evaluationDetails.cycle}</p>
                      </div>
                      {evaluationDetails.currentPhase && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Fase Atual:</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-blue-900">
                              {evaluationDetails.currentPhase}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Resumo de Participação */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Resumo de Participação no Ciclo</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {evaluationDetails.summary.totalAssessmentsReceived}
                          </div>
                          <div className="text-xs text-gray-600">Avaliações Recebidas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {evaluationDetails.summary.totalAssessmentsSent || 0}
                          </div>
                          <div className="text-xs text-gray-600">Avaliações Enviadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {(evaluationDetails.summary.totalAssessmentsReceived || 0) + (evaluationDetails.summary.totalAssessmentsSent || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Total de Participações</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${evaluationDetails.summary.hasCommitteeAssessment ? 'text-red-600' : 'text-gray-400'}`}>
                            {evaluationDetails.summary.hasCommitteeAssessment ? '✓' : '○'}
                          </div>
                          <div className="text-xs text-gray-600">Equalização</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notas Consolidadas */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notas por Tipo de Avaliação</h3>
                    
                    {/* Nota Final de Equalização (se existir) */}
                    {evaluationDetails.committeeAssessment && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="text-lg font-semibold text-red-900 mb-2">🎯 Nota Final (Equalização)</h4>
                        {renderScoreBar(evaluationDetails.committeeAssessment.finalScore, 'Nota Final do Comitê')}
                        <p className="text-sm text-red-700 mt-2">
                          Esta é a nota oficial final após análise do comitê de equalização.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {renderScoreBar(evaluationDetails.evaluationScores.selfAssessment, 'Autoavaliação')}
                        {renderScoreBar(evaluationDetails.evaluationScores.assessment360, 'Avaliação 360')}
                      </div>
                      <div>
                        {renderScoreBar(evaluationDetails.evaluationScores.managerAssessment, 'Avaliação Gestor')}
                        {renderScoreBar(evaluationDetails.evaluationScores.mentoring, 'Mentoring')}
                      </div>
                    </div>
                  </div>

                  {/* Resumo das Avaliações */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Resumo Consolidado</h3>
                    <p className="text-sm text-blue-800">{evaluationDetails.customSummary}</p>
                    
                    {/* Nota sobre Equalização */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Nota:</strong> A <em>Avaliação de Comitê</em> é o processo de <em>Equalização</em>, 
                        onde o comitê analisa todas as avaliações e define a nota final consolidada.
                        {evaluationDetails.summary.hasCommitteeAssessment 
                          ? ' ✅ Este colaborador já passou pela equalização.'
                          : ' ⏳ Este colaborador ainda aguarda a equalização do comitê.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {evaluationDetails.summary.totalAssessmentsReceived}
                      </div>
                      <div className="text-sm text-gray-600">Total de Avaliações Recebidas</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${evaluationDetails.summary.hasCommitteeAssessment ? 'text-green-600' : 'text-yellow-600'}`}>
                        {evaluationDetails.summary.hasCommitteeAssessment ? 'Sim' : 'Não'}
                      </div>
                      <div className="text-sm text-gray-600">Avaliação de Comitê</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${evaluationDetails.summary.isEqualizationComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                        {evaluationDetails.summary.isEqualizationComplete ? 'Completa' : 'Pendente'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {evaluationDetails.summary.hasCommitteeAssessment ? 'Equalização (Comitê)' : 'Aguardando Comitê'}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Avaliações Detalhadas */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">📥 Avaliações Recebidas</h3>
                      <p className="text-sm text-gray-600">Avaliações que outros fizeram sobre este colaborador</p>
                    </div>
                    
                    {/* Autoavaliação */}
                    {evaluationDetails.selfAssessment && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Autoavaliação</h4>
                        <div className="border-l-4 border-indigo-400 pl-4 py-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{evaluationDetails.collaborator.name}</p>
                              <p className="text-sm text-gray-600">Autoavaliação</p>
                            </div>
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                              {evaluationDetails.evaluationScores.selfAssessment?.toFixed(1) || 'N/A'}/5
                            </span>
                          </div>
                          {evaluationDetails.selfAssessment.answers && evaluationDetails.selfAssessment.answers.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium text-gray-700">Critérios avaliados:</p>
                              {evaluationDetails.selfAssessment.answers.map((answer: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{answer.criterionId}</span>
                                    <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-xs">
                                      {answer.score}/5
                                    </span>
                                  </div>
                                  {answer.justification && (
                                    <p className="text-gray-600 mt-1 italic">"{answer.justification}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Avaliações 360 */}
                    {evaluationDetails.assessments360Received.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Avaliações 360 ({evaluationDetails.assessments360Received.length})</h4>
                        <div className="space-y-3">
                          {evaluationDetails.assessments360Received.map((assessment: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{assessment.author.name}</p>
                                  <p className="text-sm text-gray-600">{assessment.author.jobTitle}</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                  {assessment.overallScore}/5
                                </span>
                              </div>
                              {(assessment.strengths || assessment.improvements) && (
                                <div className="mt-2 space-y-2">
                                  {assessment.strengths && (
                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                      <p className="text-blue-800 font-medium">Pontos Fortes:</p>
                                      <p className="text-blue-700 italic">"{assessment.strengths}"</p>
                                    </div>
                                  )}
                                  {assessment.improvements && (
                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                      <p className="text-blue-800 font-medium">Pontos de Melhoria:</p>
                                      <p className="text-blue-700 italic">"{assessment.improvements}"</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avaliações de Gestor */}
                    {evaluationDetails.managerAssessmentsReceived.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Avaliações de Gestor ({evaluationDetails.managerAssessmentsReceived.length})</h4>
                        <div className="space-y-3">
                          {evaluationDetails.managerAssessmentsReceived.map((assessment: any, index: number) => (
                            <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{assessment.author.name}</p>
                                  <p className="text-sm text-gray-600">{assessment.author.jobTitle}</p>
                                </div>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                  Média: {evaluationDetails.evaluationScores.managerAssessment?.toFixed(1) || 'N/A'}/5
                                </span>
                              </div>
                              {assessment.answers && assessment.answers.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Critérios avaliados:</p>
                                  {assessment.answers.map((answer: any, idx: number) => (
                                    <div key={idx} className="bg-green-50 p-2 rounded text-sm">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">{answer.criterionId}</span>
                                        <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">
                                          {answer.score}/5
                                        </span>
                                      </div>
                                      {answer.justification && (
                                        <p className="text-green-700 mt-1 italic">"{answer.justification}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {assessment.feedback && (
                                <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                                  <p className="text-green-800 font-medium">Feedback geral:</p>
                                  <p className="text-green-700 italic">"{assessment.feedback}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avaliações de Mentoring */}
                    {evaluationDetails.mentoringAssessmentsReceived.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Avaliações de Mentoring ({evaluationDetails.mentoringAssessmentsReceived.length})</h4>
                        <div className="space-y-3">
                          {evaluationDetails.mentoringAssessmentsReceived.map((assessment: any, index: number) => (
                            <div key={index} className="border-l-4 border-purple-400 pl-4 py-2">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">Mentorado: {assessment.author.name}</p>
                                  <p className="text-sm text-gray-600">{assessment.author.jobTitle}</p>
                                  <p className="text-xs text-purple-600 mt-1">Avaliação como mentor</p>
                                </div>
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                                  {assessment.score}/5
                                </span>
                              </div>
                              {assessment.justification && (
                                <div className="mt-2 bg-purple-50 p-2 rounded text-sm">
                                  <p className="text-purple-800 font-medium">Justificativa:</p>
                                  <p className="text-purple-700 italic">"{assessment.justification}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedbacks de Referência */}
                    {evaluationDetails.referenceFeedbacksReceived.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Feedbacks de Referência ({evaluationDetails.referenceFeedbacksReceived.length})</h4>
                        <div className="space-y-3">
                          {evaluationDetails.referenceFeedbacksReceived.map((feedback: any, index: number) => (
                            <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{feedback.author.name}</p>
                                  <p className="text-sm text-gray-600">{feedback.author.jobTitle}</p>
                                </div>
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                                  Referência
                                </span>
                              </div>
                              {feedback.justification && (
                                <div className="mt-2 bg-orange-50 p-2 rounded text-sm">
                                  <p className="text-orange-800 font-medium">Feedback:</p>
                                  <p className="text-orange-700 italic">"{feedback.justification}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avaliação de Comitê */}
                    {evaluationDetails.committeeAssessment && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Avaliação de Comitê (Equalização)</h4>
                        <div className="border-l-4 border-red-400 pl-4 py-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{evaluationDetails.committeeAssessment.author.name}</p>
                              <p className="text-sm text-gray-600">Membro do Comitê</p>
                            </div>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                              {evaluationDetails.committeeAssessment.finalScore}/5
                            </span>
                          </div>
                          {evaluationDetails.committeeAssessment.justification && (
                            <div className="mt-2 bg-red-50 p-2 rounded text-sm">
                              <p className="text-red-800 font-medium">Justificativa:</p>
                              <p className="text-red-700 italic">"{evaluationDetails.committeeAssessment.justification}"</p>
                            </div>
                          )}
                          {evaluationDetails.committeeAssessment.observations && (
                            <div className="mt-2 bg-red-50 p-2 rounded text-sm">
                              <p className="text-red-800 font-medium">Observações:</p>
                              <p className="text-red-700 italic">"{evaluationDetails.committeeAssessment.observations}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seção de Avaliações Enviadas */}
                    <div className="border-t border-gray-200 pt-6 mt-8">
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">📤 Avaliações Enviadas</h3>
                        <p className="text-sm text-gray-600">Avaliações que este colaborador fez sobre outros</p>
                      </div>

                      {/* Avaliações 360 Enviadas */}
                      {evaluationDetails.assessments360Sent && evaluationDetails.assessments360Sent.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Avaliações 360 Enviadas ({evaluationDetails.assessments360Sent.length})</h4>
                          <div className="space-y-3">
                            {evaluationDetails.assessments360Sent.map((assessment: any, index: number) => (
                              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">Para: {assessment.evaluatedUser.name}</p>
                                    <p className="text-sm text-gray-600">{assessment.evaluatedUser.jobTitle}</p>
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                    {assessment.overallScore}/5
                                  </span>
                                </div>
                                {assessment.strengths && (
                                  <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                                    <p className="text-blue-800 font-medium">Pontos Fortes:</p>
                                    <p className="text-blue-700 italic">"{assessment.strengths}"</p>
                                  </div>
                                )}
                                {assessment.improvements && (
                                  <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                                    <p className="text-blue-800 font-medium">Pontos de Melhoria:</p>
                                    <p className="text-blue-700 italic">"{assessment.improvements}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Avaliações de Gestor Enviadas */}
                      {evaluationDetails.managerAssessmentsSent && evaluationDetails.managerAssessmentsSent.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Avaliações de Gestor Enviadas ({evaluationDetails.managerAssessmentsSent.length})</h4>
                          <div className="space-y-3">
                            {evaluationDetails.managerAssessmentsSent.map((assessment: any, index: number) => (
                              <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">Para: {assessment.evaluatedUser.name}</p>
                                    <p className="text-sm text-gray-600">{assessment.evaluatedUser.jobTitle}</p>
                                  </div>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                    Avaliação Completa
                                  </span>
                                </div>
                                {assessment.answers && assessment.answers.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Critérios avaliados:</p>
                                    {assessment.answers.map((answer: any, idx: number) => (
                                      <div key={idx} className="bg-green-50 p-2 rounded text-sm">
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium">{answer.criterionId}</span>
                                          <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">
                                            {answer.score}/5
                                          </span>
                                        </div>
                                        {answer.justification && (
                                          <p className="text-green-700 mt-1 italic">"{answer.justification}"</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Avaliações de Mentoring Enviadas */}
                      {evaluationDetails.mentoringAssessmentsSent && evaluationDetails.mentoringAssessmentsSent.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Avaliações de Mentoring Enviadas ({evaluationDetails.mentoringAssessmentsSent.length})</h4>
                          <div className="space-y-3">
                            {evaluationDetails.mentoringAssessmentsSent.map((assessment: any, index: number) => (
                              <div key={index} className="border-l-4 border-purple-400 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">Mentor: {assessment.mentor.name}</p>
                                    <p className="text-sm text-gray-600">{assessment.mentor.jobTitle}</p>
                                  </div>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                                    {assessment.score}/5
                                  </span>
                                </div>
                                {assessment.justification && (
                                  <div className="mt-2 bg-purple-50 p-2 rounded text-sm">
                                    <p className="text-purple-800 font-medium">Justificativa:</p>
                                    <p className="text-purple-700 italic">"{assessment.justification}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedbacks de Referência Enviados */}
                      {evaluationDetails.referenceFeedbacksSent && evaluationDetails.referenceFeedbacksSent.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Feedbacks de Referência Enviados ({evaluationDetails.referenceFeedbacksSent.length})</h4>
                          <div className="space-y-3">
                            {evaluationDetails.referenceFeedbacksSent.map((feedback: any, index: number) => (
                              <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">Para: {feedback.referencedUser.name}</p>
                                    <p className="text-sm text-gray-600">{feedback.referencedUser.jobTitle}</p>
                                  </div>
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                                    Referência
                                  </span>
                                </div>
                                {feedback.topic && (
                                  <div className="mt-2 bg-orange-50 p-2 rounded text-sm">
                                    <p className="text-orange-800 font-medium">Tópico:</p>
                                    <p className="text-orange-700 font-medium">"{feedback.topic}"</p>
                                  </div>
                                )}
                                {feedback.justification && (
                                  <div className="mt-2 bg-orange-50 p-2 rounded text-sm">
                                    <p className="text-orange-800 font-medium">Feedback:</p>
                                    <p className="text-orange-700 italic">"{feedback.justification}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mensagem quando não há avaliações enviadas */}
                      {(!evaluationDetails.assessments360Sent || evaluationDetails.assessments360Sent.length === 0) &&
                       (!evaluationDetails.managerAssessmentsSent || evaluationDetails.managerAssessmentsSent.length === 0) &&
                       (!evaluationDetails.mentoringAssessmentsSent || evaluationDetails.mentoringAssessmentsSent.length === 0) &&
                       (!evaluationDetails.referenceFeedbacksSent || evaluationDetails.referenceFeedbacksSent.length === 0) && (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <p className="text-gray-600">Este colaborador ainda não enviou avaliações neste ciclo.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">Erro ao carregar dados</div>
                  <p className="text-gray-600">
                    Não foi possível carregar os detalhes das avaliações. 
                    Verifique se o ciclo está na fase de equalização.
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorManagement; 