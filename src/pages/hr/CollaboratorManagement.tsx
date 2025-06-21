import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import HRService, { 
  type CollaboratorWithEvaluationProgress, 
  type CollaboratorFilters,
  type EvaluationStepProgress
} from '../../services/HRService';

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
  const { error: showToast } = useGlobalToast();

  useEffect(() => {
    loadCollaborators();
    
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(() => {
      loadCollaborators();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [collaborators, filters, searchTerm, selectedBusinessUnit, selectedSeniority, selectedRole, showActiveOnly]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await HRService.getAllCollaboratorsWithEvaluationProgress();
      console.log('✅ Colaboradores carregados:', data.length, 'em', new Date().toLocaleTimeString());
      setCollaborators(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      showToast('Erro ao carregar colaboradores');
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
      showToast('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showToast('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
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
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Adicionar Colaborador
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
              {filteredCollaborators.filter(c => {
                const steps = HRService.getEvaluationStepsFromProgress(c.evaluationProgress);
                const progress = HRService.calculateEvaluationProgress(steps);
                return progress.progressPercentage >= 80;
              }).length}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gestor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Progresso Avaliações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funções
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCollaborators.map((collaborator, index) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-teal-800">
                              {collaborator.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {collaborator.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {collaborator.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collaborator.jobTitle}</div>
                      <div className="text-sm text-gray-500">{collaborator.seniority}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collaborator.businessUnit}</div>
                      <div className="text-sm text-gray-500">{collaborator.careerTrack}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collaborator.managerName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="pr-8">
                        {renderProgressBar(getRealEvaluationProgress(collaborator), index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {collaborator.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {getRoleDisplayName(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(collaborator.isActive)}
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
    </div>
  );
};

export default CollaboratorManagement; 