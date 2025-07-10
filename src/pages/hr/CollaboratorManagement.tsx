import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import HRService, { 
  type CollaboratorWithProjectsAndProgress, 
  type CollaboratorFilters,
  type EvaluationStepProgress,
  type Project,
  type AdvancedFiltersResponse
} from '../../services/HRService';
import CommitteeService, { type CollaboratorEvaluationSummary } from '../../services/CommitteeService';
import { Eye, X, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const CollaboratorManagement: React.FC = () => {
  const [collaborators, setCollaborators] = useState<CollaboratorWithProjectsAndProgress[]>([]);
  const [allCollaborators, setAllCollaborators] = useState<CollaboratorWithProjectsAndProgress[]>([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState<CollaboratorWithProjectsAndProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CollaboratorFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState('');
  const [selectedCareerTrack, setSelectedCareerTrack] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  // Estados para o modal de notas detalhadas
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [evaluationDetails, setEvaluationDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Estado para fase do ciclo
  const [currentCyclePhase, setCurrentCyclePhase] = useState<{
    cycleName: string;
    currentPhase: string;
    phaseDescription: string;
  } | null>(null);

  // Mapeamento para melhorar a exibição dos valores
  const roleDisplayMap: Record<string, string> = {
    'admin': 'Administrador',
    'rh': 'Recursos Humanos',
    'gestor': 'Gestor',
    'colaborador': 'Colaborador',
    'colaboradorgestor': 'Colaborador e Gestor',
    'comite': 'Comitê',
    'mentor': 'Mentor',
  };

  const seniorityDisplayMap: Record<string, string> = {
    'junior': 'Júnior',
    'pleno': 'Pleno',
    'senior': 'Sênior',
    'especialista': 'Especialista',
    'coordenador': 'Coordenador',
    'gerente': 'Gerente',
    'diretor': 'Diretor',
  };

  const careerTrackDisplayMap: Record<string, string> = {
    'tech': 'Tecnologia',
    'business': 'Negócios',
    'design': 'Design',
    'data': 'Dados',
    'product': 'Produto',
    'people': 'Pessoas',
    'finance': 'Financeiro',
    'marketing': 'Marketing',
    'sales': 'Vendas',
    'operations': 'Operações',
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Debounce para evitar chamadas excessivas da API
    const timeoutId = setTimeout(() => {
      if (allCollaborators.length > 0) { // Só aplicar filtros se já temos dados
        applyFilters();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm, 
    selectedBusinessUnit, 
    selectedSeniority, 
    selectedCareerTrack,
    selectedRole, 
    selectedProject, 
    selectedJobTitle, 
    showActiveOnly
  ]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar projetos, fase do ciclo e todos os colaboradores em paralelo
      const [projectsData, cyclePhaseData, allCollaboratorsData] = await Promise.all([
        HRService.getProjectsList(),
        HRService.getActiveCyclePhase(),
        HRService.getUsersWithAdvancedFilters({}) // Buscar todos sem filtros para as opções
      ]);
      
      setProjects(projectsData || []);
      setCurrentCyclePhase(cyclePhaseData);
      setAllCollaborators(allCollaboratorsData?.users || []); // Salvar lista completa para filtros
      
      // Carregar colaboradores usando os filtros avançados
      await loadCollaborators();
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      showErrorToast('Erro ao carregar dados iniciais');
      // Definir arrays vazios em caso de erro para evitar quebras
      setProjects([]);
      setAllCollaborators([]);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async () => {
    try {
      const currentFilters: CollaboratorFilters = {
        search: searchTerm || undefined,
        businessUnit: selectedBusinessUnit || undefined,
        seniority: selectedSeniority || undefined,
        careerTrack: selectedCareerTrack || undefined,
        roles: selectedRole ? [selectedRole] : undefined,
        projectId: selectedProject || undefined,
        jobTitle: selectedJobTitle || undefined,
        isActive: showActiveOnly ? true : undefined,
      };

      const data = await HRService.getUsersWithAdvancedFilters(currentFilters);
      
      setCollaborators(data?.users || []);
      setTotalCount(data?.totalCount || 0);
      setFilteredCount(data?.filteredCount || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      showErrorToast('Erro ao carregar colaboradores');
      // Definir arrays vazios em caso de erro
      setCollaborators([]);
      setTotalCount(0);
      setFilteredCount(0);
    }
  };

  const applyFilters = () => {
    // Como agora usamos filtros do servidor, chamamos loadCollaborators
    loadCollaborators();
  };

  const getUniqueValues = (field: keyof CollaboratorWithProjectsAndProgress): string[] => {
    try {
      // Usar a lista completa de colaboradores para gerar as opções dos filtros
      if (!allCollaborators || allCollaborators.length === 0) {
        return [];
      }
      return [...new Set(allCollaborators.map(c => c[field] as string))].filter(Boolean).sort();
    } catch (error) {
      console.error(`Erro ao obter valores únicos para ${field}:`, error);
      return [];
    }
  };

  const getUniqueJobTitles = (): string[] => {
    try {
      // Usar a lista completa de colaboradores para gerar as opções dos filtros
      if (!allCollaborators || allCollaborators.length === 0) {
        return [];
      }
      return [...new Set(allCollaborators.map(c => c.jobTitle))].filter(Boolean).sort();
    } catch (error) {
      console.error('Erro ao obter cargos únicos:', error);
      return [];
    }
  };

  const getUniqueRoles = (): string[] => {
    try {
      if (!allCollaborators || allCollaborators.length === 0) {
        return ['colaborador', 'gestor', 'admin', 'rh', 'comite'];
      }
      
      // Extrair roles de todos os colaboradores (roles é um array)
      const allRoles = allCollaborators.reduce((acc: string[], collaborator) => {
        if (collaborator.roles && Array.isArray(collaborator.roles)) {
          acc.push(...collaborator.roles);
        }
        return acc;
      }, []);
      
      // Remover duplicatas e ordenar
      const uniqueRoles = [...new Set(allRoles)].filter(Boolean).sort();
      
      // Se não há roles nos dados, usar as opções padrão
      return uniqueRoles.length > 0 ? uniqueRoles : ['colaborador', 'gestor', 'admin', 'rh', 'comite'];
    } catch (error) {
      console.error('Erro ao obter funções únicas:', error);
      return ['colaborador', 'gestor', 'admin', 'rh', 'comite'];
    }
  };

  const getRoleDisplayName = (role: string): string => {
    try {
      if (!role) return '';
      return roleDisplayMap[role.toLowerCase()] || role;
    } catch (error) {
      console.error('Erro ao obter nome da função:', error);
      return role || '';
    }
  };

  const getSeniorityDisplayName = (seniority: string): string => {
    try {
      if (!seniority) return '';
      return seniorityDisplayMap[seniority.toLowerCase()] || seniority;
    } catch (error) {
      console.error('Erro ao obter nome da senioridade:', error);
      return seniority || '';
    }
  };

  const getCareerTrackDisplayName = (track: string): string => {
    try {
      if (!track) return '';
      return careerTrackDisplayMap[track.toLowerCase()] || track;
    } catch (error) {
      console.error('Erro ao obter nome da trilha:', error);
      return track || '';
    }
  };

  const getBusinessUnitDisplayName = (unit: string): string => {
    try {
      if (!unit) return '';
      // Capitalizar primeira letra de cada palavra
      return unit.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    } catch (error) {
      console.error('Erro ao obter nome da unidade de negócio:', error);
      return unit || '';
    }
  };

  const getProgressPercentage = (progress: any): number => {
    if (typeof progress === 'number') {
      return progress;
    }
    if (progress && typeof progress === 'object') {
      return progress.percentage || 0;
    }
    return 0;
  };

  const getProgressStatus = (progress: any): string => {
    if (typeof progress === 'number') {
      return progress === 100 ? 'Concluído' : 'Em andamento';
    }
    if (progress && typeof progress === 'object') {
      return progress.status || 'Não iniciado';
    }
    return 'Não iniciado';
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



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBusinessUnit('');
    setSelectedSeniority('');
    setSelectedCareerTrack('');
    setSelectedRole('');
    setSelectedProject('');
    setSelectedJobTitle('');
    setShowActiveOnly(true);
  };

  const getRealEvaluationProgress = (collaborator: CollaboratorWithProjectsAndProgress) => {
    try {
      if (!collaborator || !collaborator.evaluationProgress) {
        return {
          completedSteps: 0,
          totalSteps: 0,
          progressPercentage: 0,
          steps: []
        };
      }
      
      const steps = HRService.getEvaluationStepsFromProgress(collaborator.evaluationProgress);
      const progress = HRService.calculateEvaluationProgress(steps);
      
      return {
        ...progress,
        steps
      };
    } catch (error) {
      console.error('Erro ao calcular progresso da avaliação:', error);
      return {
        completedSteps: 0,
        totalSteps: 0,
        progressPercentage: 0,
        steps: []
      };
    }
  };

  const renderProgressBar = (
    progressData: { completedSteps: number; totalSteps: number; progressPercentage: number; steps: EvaluationStepProgress[] },
    index: number
  ) => {
    const { completedSteps, totalSteps, progressPercentage, steps } = progressData;
    
    return (
      <div className="relative group">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {completedSteps}/{totalSteps} etapas ({progressPercentage}%)
        </div>
        
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
          <div className="absolute right-full top-3 border-4 border-transparent border-r-gray-800"></div>
        </div>
      </div>
    );
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Atualizar tanto a lista completa quanto os filtrados
      const [allCollaboratorsData] = await Promise.all([
        HRService.getUsersWithAdvancedFilters({}), // Buscar todos para manter as opções dos filtros
        loadCollaborators() // Carregar com os filtros atuais
      ]);
      
      setAllCollaborators(allCollaboratorsData?.users || []);
      showSuccessToast('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showErrorToast('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleViewScores = async (collaboratorId: string) => {
    try {
      setLoadingDetails(true);
      setSelectedCollaboratorId(collaboratorId);
      setShowScoresModal(true);
      
      // Prevenir scroll da página principal quando modal estiver aberto
      document.body.style.overflow = 'hidden';

      const details = await HRService.getCollaboratorEvaluationDetails(collaboratorId);
      setEvaluationDetails(details);
    } catch (error) {
      console.error('Erro ao buscar detalhes da avaliação:', error);
      showErrorToast('Erro ao carregar detalhes da avaliação');
      setShowScoresModal(false);
      // Restaurar scroll se ocorrer erro
      document.body.style.overflow = 'unset';
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowScoresModal(false);
    setEvaluationDetails(null);
    setSelectedCollaboratorId(null);
    // Restaurar scroll da página principal
    document.body.style.overflow = 'unset';
  };

  // Cleanup do overflow ao desmontar o componente
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedBusinessUnit) count++;
    if (selectedSeniority) count++;
    if (selectedCareerTrack) count++;
    if (selectedRole) count++;
    if (selectedProject) count++;
    if (selectedJobTitle) count++;
    if (!showActiveOnly) count++; // Contar se não está mostrando apenas ativos
    return count;
  };

  return (
    <div className="bg-gray-50 p-6">
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
            {/* Botão Filtros Avançados */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
              {getActiveFiltersCount() > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-teal-600 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Botão Atualizar */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showAdvancedFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {/* Busca */}
              <div className="md:col-span-2">
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

              {/* Unidade de Negócio (Área) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área / Unidade de Negócio
                  {allCollaborators.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <select
                  value={selectedBusinessUnit}
                  onChange={(e) => setSelectedBusinessUnit(e.target.value)}
                  disabled={allCollaborators.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas as áreas</option>
                  {getUniqueValues('businessUnit').map(unit => (
                    <option key={unit} value={unit}>
                      {getBusinessUnitDisplayName(unit)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Senioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senioridade
                  {allCollaborators.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <select
                  value={selectedSeniority}
                  onChange={(e) => setSelectedSeniority(e.target.value)}
                  disabled={allCollaborators.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas</option>
                  {getUniqueValues('seniority').map(seniority => (
                    <option key={seniority} value={seniority}>
                      {getSeniorityDisplayName(seniority)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trilha de Carreira */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trilha de Carreira
                  {allCollaborators.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <select
                  value={selectedCareerTrack}
                  onChange={(e) => setSelectedCareerTrack(e.target.value)}
                  disabled={allCollaborators.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas</option>
                  {getUniqueValues('careerTrack').map(track => (
                    <option key={track} value={track}>
                      {getCareerTrackDisplayName(track)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Função */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                  {allCollaborators.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={allCollaborators.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas</option>
                  {getUniqueRoles().map(role => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projeto
                  {projects.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={projects.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todos os projetos</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                  {allCollaborators.length === 0 && (
                    <span className="ml-2 text-xs text-gray-400">(carregando...)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={selectedJobTitle}
                  onChange={(e) => setSelectedJobTitle(e.target.value)}
                  disabled={allCollaborators.length === 0}
                  placeholder="Ex: Desenvolvedor, Analista..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Status Ativo/Inativo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showActiveOnly"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="showActiveOnly" className="ml-2 text-sm font-medium text-gray-700">
                  Mostrar apenas colaboradores ativos
                </label>
              </div>

              {/* Botão Limpar Filtros */}
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total no Sistema</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Colaboradores Ativos</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {collaborators ? collaborators.filter(c => c?.isActive).length : 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }) : 'Nunca'}
            </p>
            <p className="text-xs text-gray-500">
              {lastUpdated ? lastUpdated.toLocaleDateString('pt-BR') : ''}
            </p>
          </div>
        </div>

        {/* Tabela de Colaboradores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="ml-4 text-gray-700">Carregando colaboradores...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colaborador
                      </th>
                      <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo / Senioridade
                      </th>
                      <th className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Área / Trilha
                      </th>
                      <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Projetos
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
                    {collaborators && collaborators.length > 0 ? collaborators.map((collaborator, index) => {
                      // Verificar se collaborator existe e tem dados válidos
                      if (!collaborator || !collaborator.id) {
                        return null;
                      }

                      return (
                        <tr key={collaborator.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-teal-800">
                                    {collaborator.name ? collaborator.name.charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 overflow-hidden">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {collaborator.name || 'Nome não disponível'}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {collaborator.email || 'Email não disponível'}
                                </div>
                                {/* Mostrar funções em telas pequenas */}
                                <div className="flex flex-wrap gap-1 mt-1 md:hidden">
                                  {collaborator.roles && collaborator.roles.slice(0, 2).map((role) => (
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
                            <div className="text-sm text-gray-900 truncate">{collaborator.jobTitle || 'Cargo não definido'}</div>
                            <div className="text-sm text-gray-500 truncate">{getSeniorityDisplayName(collaborator.seniority || '')}</div>
                            {/* Mostrar área em telas pequenas */}
                            <div className="text-xs text-gray-400 truncate lg:hidden mt-1">
                              {getBusinessUnitDisplayName(collaborator.businessUnit || '')}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-900 truncate">{getBusinessUnitDisplayName(collaborator.businessUnit || '')}</div>
                            <div className="text-sm text-gray-500 truncate">{getCareerTrackDisplayName(collaborator.careerTrack || '')}</div>
                          </td>
                          
                          <td className="px-4 py-4 text-sm text-gray-900 hidden xl:table-cell">
                            <div className="space-y-1">
                              {collaborator.projects && collaborator.projects.length > 0 ? (
                                collaborator.projects.slice(0, 2).map((project, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="truncate flex-1">{project.name || 'Projeto sem nome'}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      project.roleInProject === 'MANAGER' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : project.roleInProject === 'LEADER'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {project.roleInProject === 'MANAGER' 
                                        ? 'Gestor' 
                                        : project.roleInProject === 'LEADER' 
                                        ? 'Líder' 
                                        : 'Membro'}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">Nenhum projeto</span>
                              )}
                              {collaborator.projects && collaborator.projects.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{collaborator.projects.length - 2} mais
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="w-full">
                              {renderProgressBar(getRealEvaluationProgress(collaborator), index)}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 hidden md:table-cell">
                            {getStatusBadge(collaborator.isActive || false)}
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
                              {getStatusBadge(collaborator.isActive || false)}
                            </div>
                          </td>
                        </tr>
                      );
                    }).filter(Boolean) : null}
                  </tbody>
                </table>
              </div>

              {collaborators.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">Nenhum colaborador encontrado</div>
                  <p className="text-gray-400">Tente ajustar os filtros para encontrar colaboradores.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Notas Detalhadas */}
      {showScoresModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
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
                        <h4 className="text-lg font-semibold text-red-900 mb-2">Nota Final (Equalização)</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {evaluationDetails.committeeAssessment.finalScore?.toFixed(1) || 'N/A'}/5
                          </div>
                          <div className="text-sm text-red-700">Nota Final do Comitê</div>
                        </div>
                        <p className="text-sm text-red-700 mt-2">
                          Esta é a nota oficial final após análise do comitê de equalização.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-indigo-600">
                          {evaluationDetails.evaluationScores.selfAssessment?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Autoavaliação</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {evaluationDetails.evaluationScores.assessment360?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Avaliação 360</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {evaluationDetails.evaluationScores.managerAssessment?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Avaliação Gestor</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {evaluationDetails.evaluationScores.mentoring?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Mentoring</div>
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
                          ? ' Este colaborador já passou pela equalização.'
                          : ' Este colaborador ainda aguarda a equalização do comitê.'
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Avaliações Recebidas</h3>
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

// Wrapper com tratamento de erro
const CollaboratorManagementWrapper: React.FC = () => {
  try {
    return <CollaboratorManagement />;
  } catch (error) {
    console.error('Erro ao renderizar CollaboratorManagement:', error);
    return (
      <div className="bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Ops! Ocorreu um erro
            </div>
            <p className="text-gray-600 mb-4">
              Houve um problema ao carregar a página de gestão de colaboradores.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default CollaboratorManagementWrapper; 