import { type FC, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  Copy,
  Edit3,
  AlertCircle,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  useCommitteeCollaborators,
  useCommitteeAssessmentActions,
  useCommitteeMetrics,
} from '../../hooks/useCommittee';
import CommitteeService, {
  type CollaboratorForEqualization,
  type CommitteeAssessment,
} from '../../services/CommitteeService';
import ExportButton from '../../components/ExportButton';
import GenAISummaryCard from '../../components/cards/GenAISummaryCard';
import { useGlobalToast } from '../../hooks/useGlobalToast';

interface ProcessedCollaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Pendente' | 'Finalizado';
  statusColor: string;
  selfAssessment: number | null;
  assessment360: number | null;
  managerAssessment: number | null;
  mentoring: number | null;
  finalScore: number | null;
  committeeAssessmentId?: string;
  committeeAssessmentStatus?: 'DRAFT' | 'SUBMITTED';
}

const EqualizacoesPage: FC = () => {
  const toast = useGlobalToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<string[]>([]); // Usar IDs de string
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [justifications, setJustifications] = useState<{ [key: string]: string }>({});

  const [editingCollaborators, setEditingCollaborators] = useState<string[]>([]);
  const [collaboratorSummaries, setCollaboratorSummaries] = useState<{ [key: string]: any }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showGenAI, setShowGenAI] = useState<{ [key: string]: boolean }>({});
  const [activeFilters, setActiveFilters] = useState({
    status: 'all', // 'all', 'pending', 'completed'
    discrepancy: 'all', // 'all', 'high', 'moderate', 'low'
    scoreRange: 'all', // 'all', '1-2', '3', '4-5'
  });
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const { data: collaboratorsData, loading, error, refetch } = useCommitteeCollaborators();
  const { data: metricsData, loading: metricsLoading } = useCommitteeMetrics();
  const {
    createAssessment,
    updateAssessment,
    submitAssessment,
    loading: actionLoading,
  } = useCommitteeAssessmentActions();

  // Buscar dados de summary quando um card é expandido
  const fetchCollaboratorSummary = async (collaboratorId: string) => {
    if (collaboratorSummaries[collaboratorId]) return; // Já carregado

    try {
      const summary = await CommitteeService.getCollaboratorEvaluationSummary(collaboratorId);
      setCollaboratorSummaries(prev => ({
        ...prev,
        [collaboratorId]: summary,
      }));
    } catch (error) {
      console.error('Erro ao buscar summary do colaborador:', error);
    }
  };

  // Processar dados reais do back-end
  const processedCollaborators: ProcessedCollaborator[] = (collaboratorsData?.collaborators || []).map(
    (collaborator: CollaboratorForEqualization) => {
      const summary = collaboratorSummaries[collaborator.id];
      const evaluationScores = summary?.evaluationScores;

      return {
        id: collaborator.id,
        name: collaborator.name,
        role: collaborator.jobTitle,
        avatar: collaborator.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        status: collaborator.hasCommitteeAssessment ? 'Finalizado' : 'Pendente',
        statusColor: collaborator.hasCommitteeAssessment
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800',
        selfAssessment: evaluationScores?.selfAssessment || null,
        assessment360: evaluationScores?.assessment360 || null,
        managerAssessment: evaluationScores?.managerAssessment || null,
        mentoring: evaluationScores?.mentoring || null,
        finalScore: collaborator.committeeAssessment?.finalScore || null,
        committeeAssessmentId: collaborator.committeeAssessment?.id,
        committeeAssessmentStatus: collaborator.committeeAssessment?.status,
      };
    },
  );

  const filteredCollaborators = processedCollaborators.filter(collaborator => {
    // Filtro de busca
    const matchesSearch =
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.role.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de status
    const matchesStatus =
      activeFilters.status === 'all' ||
      (activeFilters.status === 'pending' && collaborator.status === 'Pendente') ||
      (activeFilters.status === 'completed' && collaborator.status === 'Finalizado');

    // Filtro de discrepância
    let matchesDiscrepancy = true;
    if (activeFilters.discrepancy !== 'all') {
      const scores = [
        collaborator.selfAssessment,
        collaborator.assessment360,
        collaborator.managerAssessment,
        collaborator.mentoring,
      ].filter(score => score !== null && score !== undefined);

      if (scores.length >= 2) {
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const difference = maxScore - minScore;

        if (activeFilters.discrepancy === 'high') {
          matchesDiscrepancy = difference >= 1.5;
        } else if (activeFilters.discrepancy === 'moderate') {
          matchesDiscrepancy = difference >= 1.0 && difference < 1.5;
        } else if (activeFilters.discrepancy === 'low') {
          matchesDiscrepancy = difference < 1.0;
        }
      } else {
        // Colaboradores com menos de 2 notas são considerados "baixa discrepância"
        // pois não há dados suficientes para calcular discrepância
        if (activeFilters.discrepancy === 'high' || activeFilters.discrepancy === 'moderate') {
          matchesDiscrepancy = false;
        } else if (activeFilters.discrepancy === 'low') {
          matchesDiscrepancy = true;
        }
      }
    }

    // Filtro de faixa de nota final
    const matchesScoreRange =
      activeFilters.scoreRange === 'all' ||
      (activeFilters.scoreRange === '1-2' && collaborator.finalScore && collaborator.finalScore <= 2) ||
      (activeFilters.scoreRange === '3' && collaborator.finalScore && collaborator.finalScore === 3) ||
      (activeFilters.scoreRange === '4-5' && collaborator.finalScore && collaborator.finalScore >= 4);

    return matchesSearch && matchesStatus && matchesDiscrepancy && matchesScoreRange;
  });

  // Lógica de paginação
  const totalPages = Math.ceil(filteredCollaborators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCollaborators = filteredCollaborators.slice(startIndex, endIndex);

  // Resetar página atual quando filtros mudarem
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Atualizar página atual quando houver mudanças nos filtros
  useEffect(() => {
    resetPagination();
  }, [searchTerm, activeFilters.status, activeFilters.discrepancy, activeFilters.scoreRange]);

  // Verificar se a página atual tem conteúdo válido após filtros
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calcular métricas para os cards
  const totalCollaborators = processedCollaborators.length;
  const pendingCount = processedCollaborators.filter(c => c.status === 'Pendente').length;
  const completedCount = processedCollaborators.filter(c => c.status === 'Finalizado').length;
  const completionPercentage = totalCollaborators > 0 ? Math.round((completedCount / totalCollaborators) * 100) : 0;

  // Dados de métricas do backend
  const daysRemaining = metricsData?.deadlines?.daysRemaining || null;

  // Detectar colaboradores com discrepâncias altas
  const highDiscrepancyCount = processedCollaborators.filter(collaborator => {
    const scores = [
      collaborator.selfAssessment,
      collaborator.assessment360,
      collaborator.managerAssessment,
      collaborator.mentoring,
    ].filter(score => score !== null && score !== undefined);

    if (scores.length < 2) return false;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    return maxScore - minScore >= 1.5; // Alta discrepância
  }).length;

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const isExpanding = !prev.includes(id);

      if (isExpanding) {
        // Buscar dados do colaborador quando expandir
        fetchCollaboratorSummary(id);
        return [...prev, id];
      } else {
        return prev.filter(cardId => cardId !== id);
      }
    });
  };

  const handleRatingChange = (collaboratorId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [collaboratorId]: rating,
    }));
  };

  const handleJustificationChange = (collaboratorId: string, text: string) => {
    setJustifications(prev => ({
      ...prev,
      [collaboratorId]: text,
    }));
  };

  const handleSubmit = async (collaborator: ProcessedCollaborator) => {
    const rating = ratings[collaborator.id];
    const justification = justifications[collaborator.id];
    if (!rating || !justification?.trim()) {
      toast.warning('Campos Obrigatórios', 'Por favor, preencha a avaliação e justificativa antes de concluir.');
      return;
    }
    try {
      if (collaborator.committeeAssessmentId) {
        await updateAssessment(collaborator.committeeAssessmentId, {
          finalScore: rating,
          justification: justification.trim(),
        });
      } else {
        await createAssessment({
          evaluatedUserId: collaborator.id,
          finalScore: rating,
          justification: justification.trim(),
        });
      }
      toast.success('Avaliação Submetida!', 'A avaliação foi salva com sucesso.');
      setEditingCollaborators(prev => prev.filter(id => id !== collaborator.id));
      refetch();
    } catch (error) {
      console.error('Erro ao submeter avaliação:', error);
      toast.error('Erro ao Submeter', 'Não foi possível salvar a avaliação. Tente novamente.');
    }
  };

  const handleEditResult = async (collaborator: ProcessedCollaborator) => {
    // Adicionar ao modo de edição
    setEditingCollaborators(prev => [...prev, collaborator.id]);
    // Pré-preencher os campos com os valores atuais
    if (collaborator.finalScore) {
      setRatings(prev => ({
        ...prev,
        [collaborator.id]: collaborator.finalScore!,
      }));
    }
    // Buscar justificativa existente se tiver ID da avaliação
    if (collaborator.committeeAssessmentId) {
      try {
        // Buscar detalhes da avaliação existente
        const assessments = await CommitteeService.getAllCommitteeAssessments();
        const existingAssessment = assessments.assessments.find(
          (assessment: CommitteeAssessment) => assessment.id === collaborator.committeeAssessmentId,
        );
        if (existingAssessment) {
          setJustifications(prev => ({
            ...prev,
            [collaborator.id]: existingAssessment.justification,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar justificativa existente:', error);
        // Continua sem a justificativa se houver erro
      }
    }
  };

  const handleCancelEdit = (collaboratorId: string) => {
    // Remover do modo de edição
    setEditingCollaborators(prev => prev.filter(id => id !== collaboratorId));

    // Limpar os campos
    setRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[collaboratorId];
      return newRatings;
    });

    setJustifications(prev => {
      const newJustifications = { ...prev };
      delete newJustifications[collaboratorId];
      return newJustifications;
    });
  };

  const handleCopyResult = (collaborator: ProcessedCollaborator) => {
    const resultText = `Colaborador: ${collaborator.name}\nCargo: ${collaborator.role}\nNota Final: ${collaborator.finalScore}\nAutoavaliação: ${collaborator.selfAssessment}\nAvaliação 360: ${collaborator.assessment360}\nAvaliação Gestor: ${collaborator.managerAssessment}`;

    navigator.clipboard
      .writeText(resultText)
      .then(() => {
        toast.success('Resultado Copiado!', 'Os dados foram copiados para a área de transferência.');
      })
      .catch(() => {
        toast.error('Erro ao Copiar', 'Não foi possível copiar o resultado. Tente novamente.');
      });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: 'all',
      discrepancy: 'all',
      scoreRange: 'all',
    });
  };

  const hasActiveFilters =
    activeFilters.status !== 'all' || activeFilters.discrepancy !== 'all' || activeFilters.scoreRange !== 'all';

  const StarRating: FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={`transition-colors ${star <= rating ? 'text-[#085F60]' : 'text-gray-300'}`}
          >
            <Star className='w-5 h-5 fill-current' />
          </button>
        ))}
      </div>
    );
  };

  const handleGenAISummaryGenerated = (collaboratorId: string, summary: string) => {
    // Atualizar o resumo do colaborador com o resumo gerado por IA
    setCollaboratorSummaries(prev => ({
      ...prev,
      [collaboratorId]: {
        ...prev[collaboratorId],
        customSummary: summary,
      },
    }));
  };

  const toggleGenAI = (collaboratorId: string) => {
    setShowGenAI(prev => ({
      ...prev,
      [collaboratorId]: !prev[collaboratorId],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]'></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar dados</h3>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={() => refetch()}
              className='bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors'
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900'>Equalizações</h1>
      </div>

      {/* Cards de Métricas */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        {/* Total de Colaboradores */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-600'>Total</h3>
              <p className='text-xs text-gray-500'>Colaboradores no ciclo</p>
              <div className='text-2xl font-bold text-blue-600 mt-1'>{totalCollaborators}</div>
            </div>
          </div>
        </div>

        {/* Equalizações Pendentes */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
              <Clock className='w-6 h-6 text-yellow-600' />
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-600'>Pendentes</h3>
              <p className='text-xs text-gray-500'>Aguardando equalização</p>
              <div className='text-2xl font-bold text-yellow-600 mt-1'>{pendingCount}</div>
            </div>
          </div>
        </div>

        {/* Equalizações Finalizadas */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-600'>Finalizadas</h3>
              <p className='text-xs text-gray-500'>Equalizações concluídas</p>
              <div className='text-2xl font-bold text-green-600 mt-1'>{completedCount}</div>
            </div>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-[#085F60] bg-opacity-10 rounded-lg flex items-center justify-center'>
              <TrendingUp className='w-6 h-6 text-[#085F60]' />
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-600'>Progresso</h3>
              <p className='text-xs text-gray-500'>Percentual concluído</p>
              <div className='flex items-center gap-2 mt-1'>
                <div className='text-2xl font-bold text-[#085F60]'>{completionPercentage}%</div>
                <div className='flex-1 bg-gray-200 rounded-full h-2 w-16'>
                  <div
                    className='bg-[#085F60] h-2 rounded-full transition-all duration-300'
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Prazos */}
      <div className='space-y-4 mb-6'>
        {/* Alerta de Prazo */}
        {daysRemaining !== null && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              daysRemaining <= 2
                ? 'bg-red-50 border-red-400'
                : daysRemaining <= 5
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
            }`}
          >
            <div className='flex items-center gap-3'>
              <Calendar
                className={`w-5 h-5 ${
                  daysRemaining <= 2 ? 'text-red-600' : daysRemaining <= 5 ? 'text-yellow-600' : 'text-blue-600'
                }`}
              />
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    daysRemaining <= 2 ? 'text-red-900' : daysRemaining <= 5 ? 'text-yellow-900' : 'text-blue-900'
                  }`}
                >
                  {daysRemaining <= 2
                    ? '🚨 Prazo Crítico!'
                    : daysRemaining <= 5
                      ? '⚠️ Prazo Próximo'
                      : '📅 Prazo para Equalização'}
                </h4>
                <p
                  className={`text-sm ${
                    daysRemaining <= 2 ? 'text-red-800' : daysRemaining <= 5 ? 'text-yellow-800' : 'text-blue-800'
                  }`}
                >
                  {daysRemaining === 0
                    ? 'Último dia para finalizar as equalizações!'
                    : daysRemaining === 1
                      ? 'Resta apenas 1 dia para finalizar as equalizações'
                      : `Restam ${daysRemaining} dias para finalizar as equalizações`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Discrepâncias */}
        {highDiscrepancyCount > 0 && (
          <div className='p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400'>
            <div className='flex items-center gap-3'>
              <AlertCircle className='w-5 h-5 text-orange-600' />
              <div>
                <h4 className='text-sm font-semibold text-orange-900'>⚠️ Discrepâncias Detectadas</h4>
                <p className='text-sm text-orange-800'>
                  {highDiscrepancyCount} colaborador{highDiscrepancyCount > 1 ? 'es' : ''} com discrepâncias altas (≥1.5
                  pontos) entre avaliações. Requer atenção especial do comitê.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className='mb-6'>
        <div className='flex gap-4 items-start'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Buscar por colaboradores'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent'
            />
          </div>

          {/* Botão de Filtro */}
          <div className='relative'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
                hasActiveFilters
                  ? 'bg-[#085F60] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className='w-4 h-4' />
              {hasActiveFilters && (
                <span className='bg-white text-[#085F60] text-xs px-1.5 py-0.5 rounded-full font-medium'>•</span>
              )}
            </button>

            {/* Dropdown de Filtros */}
            {showFilters && (
              <div className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                <div className='p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>Filtros</h3>
                    <button onClick={() => setShowFilters(false)} className='text-gray-400 hover:text-gray-600'>
                      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>

                  <div className='space-y-4'>
                    {/* Filtro de Status */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Status da Equalização</label>
                      <div className='space-y-2'>
                        {[
                          { value: 'all', label: 'Todos' },
                          { value: 'pending', label: 'Pendentes' },
                          { value: 'completed', label: 'Finalizadas' },
                        ].map(option => (
                          <label key={option.value} className='flex items-center'>
                            <input
                              type='radio'
                              name='status'
                              value={option.value}
                              checked={activeFilters.status === option.value}
                              onChange={e => handleFilterChange('status', e.target.value)}
                              className='mr-2 text-[#085F60] focus:ring-[#085F60]'
                            />
                            <span className='text-sm text-gray-700'>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filtro de Discrepância */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Nível de Discrepância</label>
                      <div className='space-y-2'>
                        {[
                          { value: 'all', label: 'Todas' },
                          { value: 'high', label: 'Alta (≥1.5 pontos)' },
                          { value: 'moderate', label: 'Moderada (1.0-1.4 pontos)' },
                          { value: 'low', label: 'Baixa (<1.0 ponto)' },
                        ].map(option => (
                          <label key={option.value} className='flex items-center'>
                            <input
                              type='radio'
                              name='discrepancy'
                              value={option.value}
                              checked={activeFilters.discrepancy === option.value}
                              onChange={e => handleFilterChange('discrepancy', e.target.value)}
                              className='mr-2 text-[#085F60] focus:ring-[#085F60]'
                            />
                            <span className='text-sm text-gray-700'>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filtro de Faixa de Nota */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Faixa de Nota Final</label>
                      <div className='space-y-2'>
                        {[
                          { value: 'all', label: 'Todas as notas' },
                          { value: '1-2', label: 'Baixa (1-2)' },
                          { value: '3', label: 'Média (3)' },
                          { value: '4-5', label: 'Alta (4-5)' },
                        ].map(option => (
                          <label key={option.value} className='flex items-center'>
                            <input
                              type='radio'
                              name='scoreRange'
                              value={option.value}
                              checked={activeFilters.scoreRange === option.value}
                              onChange={e => handleFilterChange('scoreRange', e.target.value)}
                              className='mr-2 text-[#085F60] focus:ring-[#085F60]'
                            />
                            <span className='text-sm text-gray-700'>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200'>
                    <button
                      onClick={clearAllFilters}
                      className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Limpar Filtros
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className='flex-1 px-4 py-2 bg-[#085F60] text-white rounded-lg hover:bg-[#064b4c] transition-colors'
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicadores de Filtros Ativos */}
        {hasActiveFilters && (
          <div className='mt-3 flex flex-wrap gap-2'>
            <span className='text-sm text-gray-600'>Filtros ativos:</span>
            {activeFilters.status !== 'all' && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                Status: {activeFilters.status === 'pending' ? 'Pendentes' : 'Finalizadas'}
                <button onClick={() => handleFilterChange('status', 'all')} className='hover:text-blue-600'>
                  ×
                </button>
              </span>
            )}
            {activeFilters.discrepancy !== 'all' && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full'>
                Discrepância:{' '}
                {activeFilters.discrepancy === 'high'
                  ? 'Alta'
                  : activeFilters.discrepancy === 'moderate'
                    ? 'Moderada'
                    : 'Baixa'}
                <button onClick={() => handleFilterChange('discrepancy', 'all')} className='hover:text-orange-600'>
                  ×
                </button>
              </span>
            )}
            {activeFilters.scoreRange !== 'all' && (
              <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Nota: {activeFilters.scoreRange === '1-2' ? '1-2' : activeFilters.scoreRange === '3' ? '3' : '4-5'}
                <button onClick={() => handleFilterChange('scoreRange', 'all')} className='hover:text-green-600'>
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista de Colaboradores */}
      {filteredCollaborators.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalPages > 1 ? (
              <>
                Página {currentPage} de {totalPages} • 
                Mostrando {paginatedCollaborators.length} de {filteredCollaborators.length} colaboradores
              </>
            ) : (
              `${filteredCollaborators.length} colaborador${filteredCollaborators.length !== 1 ? 'es' : ''} encontrado${filteredCollaborators.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {paginatedCollaborators.length === 0 && filteredCollaborators.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou a busca para ver os colaboradores.</p>
          </div>
        ) : paginatedCollaborators.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador nesta página</h3>
            <p className="text-gray-500">Navegue para outras páginas para ver mais colaboradores.</p>
          </div>
        ) : (
          paginatedCollaborators.map((collaborator) => (
            <div key={collaborator.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header do Card */}
              <div
                className='p-4 cursor-pointer hover:bg-gray-50 transition-colors'
                onClick={() => toggleCardExpansion(collaborator.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700'>
                      {collaborator.avatar}
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900'>{collaborator.name}</h3>
                      <p className='text-sm text-gray-500'>{collaborator.role}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        editingCollaborators.includes(collaborator.id)
                          ? 'bg-orange-100 text-orange-800'
                          : collaborator.statusColor
                      }`}
                    >
                      {editingCollaborators.includes(collaborator.id) ? 'Editando' : collaborator.status}
                    </span>
                  </div>

                  {/* Notas resumidas */}
                  <div className='flex items-center gap-6 text-sm'>
                    <div className='text-center'>
                      <div className='text-xs text-gray-500'>Autoavaliação</div>
                      <div className='font-medium'>{collaborator.selfAssessment || '--'}</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs text-gray-500'>Avaliação 360</div>
                      <div className='font-medium'>{collaborator.assessment360 || '--'}</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs text-gray-500'>Nota gestor</div>
                      <div className='font-medium'>{collaborator.managerAssessment || '--'}</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs text-gray-500'>Nota final</div>
                      <div className='font-medium'>
                        {collaborator.finalScore ? (
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#085F60] text-white'>
                            {collaborator.finalScore}
                          </span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </div>
                    </div>
                    <button className='text-gray-400 hover:text-gray-600'>
                      <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                        <path
                          fillRule='evenodd'
                          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {expandedCards.includes(collaborator.id) && (
                <div className='px-4 pb-4 border-t border-gray-100'>
                  <div className='pt-4'>
                    {/* Botão para mostrar/ocultar GenAI */}
                    <div className='mb-4 flex justify-between items-center'>
                      <h4 className='text-lg font-semibold text-gray-900'>Análise Inteligente</h4>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleGenAI(collaborator.id);
                        }}
                        className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm'
                      >
                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        {showGenAI[collaborator.id] ? 'Ocultar IA' : '🤖 Análise Inteligente'}
                      </button>
                    </div>

                    {/* Componente GenAI */}
                    {showGenAI[collaborator.id] && (
                      <div className='mb-6'>
                        <GenAISummaryCard
                          collaboratorId={collaborator.id}
                          collaboratorName={collaborator.name}
                          cycle={metricsData?.cycle || '2025.1'}
                          onSummaryGenerated={summary => handleGenAISummaryGenerated(collaborator.id, summary)}
                        />
                      </div>
                    )}

                    {/* Barras de Progresso */}
                    <div className='grid grid-cols-3 gap-6 mb-6'>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm text-gray-600'>Autoavaliação</span>
                          <span className='text-sm font-medium text-[#085F60]'>{collaborator.selfAssessment || 0}</span>
                        </div>
                        <div className='h-2 bg-gray-200 rounded-full'>
                          <div
                            className='h-2 bg-[#085F60] rounded-full'
                            style={{ width: `${((collaborator.selfAssessment || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm text-gray-600'>Avaliação Gestor</span>
                          <span className='text-sm font-medium text-[#085F60]'>
                            {collaborator.managerAssessment || 0}
                          </span>
                        </div>
                        <div className='h-2 bg-gray-200 rounded-full'>
                          <div
                            className='h-2 bg-[#085F60] rounded-full'
                            style={{ width: `${((collaborator.managerAssessment || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm text-gray-600'>Avaliação 360</span>
                          <span className='text-sm font-medium text-[#085F60]'>{collaborator.assessment360 || 0}</span>
                        </div>
                        <div className='h-2 bg-gray-200 rounded-full'>
                          <div
                            className='h-2 bg-[#085F60] rounded-full'
                            style={{ width: `${((collaborator.assessment360 || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {collaborator.status === 'Pendente' || editingCollaborators.includes(collaborator.id) ? (
                      <>
                        {/* Sistema de Avaliação */}
                        <div className='mb-6'>
                          <p className='text-sm text-gray-600 mb-3'>Dê uma avaliação de 1 a 5</p>
                          <StarRating
                            rating={ratings[collaborator.id] || 0}
                            onRatingChange={rating => handleRatingChange(collaborator.id, rating)}
                          />
                        </div>

                        {/* Campo de Justificativa */}
                        <div className='mb-6'>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Justifique sua nota</label>
                          <textarea
                            rows={3}
                            placeholder='Justifique sua nota'
                            value={justifications[collaborator.id] || ''}
                            onChange={e => handleJustificationChange(collaborator.id, e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent resize-none'
                          />
                        </div>

                        {/* Botões de Ação */}
                        <div className='flex justify-end gap-3'>
                          {editingCollaborators.includes(collaborator.id) && (
                            <button
                              onClick={() => handleCancelEdit(collaborator.id)}
                              disabled={actionLoading}
                              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => handleSubmit(collaborator)}
                            disabled={actionLoading}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                              actionLoading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#085F60] text-white hover:bg-[#064b4c]'
                            }`}
                          >
                            {actionLoading
                              ? 'Salvando...'
                              : editingCollaborators.includes(collaborator.id)
                                ? 'Salvar Alterações'
                                : 'Concluir'}
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Colaborador Finalizado */
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                            <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <div className='text-sm'>
                            <span className='text-gray-600'>Avaliação concluída com nota </span>
                            <span className='font-semibold text-[#085F60]'>{collaborator.finalScore}</span>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleCopyResult(collaborator)}
                            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                            title='Copiar resultado'
                          >
                            <Copy className='w-4 h-4' />
                          </button>
                          <ExportButton
                            collaboratorId={collaborator.id}
                            collaboratorName={collaborator.name}
                            hasCommitteeAssessment={collaborator.status === 'Finalizado'}
                            variant='button'
                          />
                          <button
                            onClick={() => handleEditResult(collaborator)}
                            className='flex items-center gap-2 px-4 py-2 border border-[#085F60] text-[#085F60] rounded-lg hover:bg-[#085F60] hover:text-white transition-colors'
                            title='Editar resultado'
                          >
                            <Edit3 className='w-4 h-4' />
                            Editar resultado
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(endIndex, filteredCollaborators.length)}</span> de{' '}
                <span className="font-medium">{filteredCollaborators.length}</span> colaboradores
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-[#085F60] border-[#085F60] text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Próximo</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EqualizacoesPage;
