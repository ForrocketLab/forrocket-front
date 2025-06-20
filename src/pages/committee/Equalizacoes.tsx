import { type FC, useState, useEffect } from 'react';
import { Search, Filter, Star, Copy, Edit3, AlertCircle } from 'lucide-react';
import { useCommitteeCollaborators, useCollaboratorEvaluationSummary, useCommitteeAssessmentActions } from '../../hooks/useCommittee';
import CommitteeService, { type CollaboratorForEqualization, type CommitteeAssessment } from '../../services/CommitteeService';
import ExportButton from '../../components/ExportButton';
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
  finalScore: number | null;
  summary: string;
  committeeAssessmentId?: string;
}

const EqualizacoesPage: FC = () => {
  const toast = useGlobalToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<string[]>([]); // Usar IDs de string
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [justifications, setJustifications] = useState<{[key: string]: string}>({});
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [editingCollaborators, setEditingCollaborators] = useState<string[]>([]);
  const [collaboratorSummaries, setCollaboratorSummaries] = useState<{[key: string]: any}>({});
  
  const { data: collaboratorsData, loading, error, refetch } = useCommitteeCollaborators();
  const { createAssessment, updateAssessment, submitAssessment, loading: actionLoading } = useCommitteeAssessmentActions();

  // Buscar dados de summary quando um card é expandido
  const fetchCollaboratorSummary = async (collaboratorId: string) => {
    if (collaboratorSummaries[collaboratorId]) return; // Já carregado
    
    try {
      const summary = await CommitteeService.getCollaboratorEvaluationSummary(collaboratorId);
      setCollaboratorSummaries(prev => ({
        ...prev,
        [collaboratorId]: summary
      }));
    } catch (error) {
      console.error('Erro ao buscar summary do colaborador:', error);
    }
  };

  // Processar dados reais do back-end
  const processedCollaborators: ProcessedCollaborator[] = (collaboratorsData?.collaborators || []).map((collaborator: CollaboratorForEqualization) => {
    const summary = collaboratorSummaries[collaborator.id];
    const evaluationScores = summary?.evaluationScores;
    
    return {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.jobTitle,
      avatar: collaborator.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      status: collaborator.hasCommitteeAssessment ? 'Finalizado' : 'Pendente',
      statusColor: collaborator.hasCommitteeAssessment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
      selfAssessment: evaluationScores?.selfAssessment || null,
      assessment360: evaluationScores?.assessment360 || null,
      managerAssessment: evaluationScores?.managerAssessment || null,
      finalScore: collaborator.committeeAssessment?.finalScore || null,
      summary: summary?.customSummary || 'Clique para carregar dados de avaliação...',
      committeeAssessmentId: collaborator.committeeAssessment?.id
    };
  });

  const filteredCollaborators = processedCollaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      [collaboratorId]: rating
    }));
  };

  const handleJustificationChange = (collaboratorId: string, text: string) => {
    setJustifications(prev => ({
      ...prev,
      [collaboratorId]: text
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
          justification: justification.trim()
        });
      } else {
        await createAssessment({
          evaluatedUserId: collaborator.id,
          finalScore: rating,
          justification: justification.trim()
        });
      }
      
      toast.success('Avaliação Submetida!', 'A avaliação foi salva com sucesso.');
      
      // Remover do modo de edição se estava sendo editado
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
        [collaborator.id]: collaborator.finalScore!
      }));
    }
    
    // Buscar justificativa existente se tiver ID da avaliação
    if (collaborator.committeeAssessmentId) {
      try {
        // Buscar detalhes da avaliação existente
        const assessments = await CommitteeService.getAllCommitteeAssessments();
        const existingAssessment = assessments.assessments.find(
          (assessment: CommitteeAssessment) => assessment.id === collaborator.committeeAssessmentId
        );
        
        if (existingAssessment) {
          setJustifications(prev => ({
            ...prev,
            [collaborator.id]: existingAssessment.justification
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
    
    navigator.clipboard.writeText(resultText).then(() => {
      toast.success('Resultado Copiado!', 'Os dados foram copiados para a área de transferência.');
    }).catch(() => {
      toast.error('Erro ao Copiar', 'Não foi possível copiar o resultado. Tente novamente.');
    });
  };

  const StarRating: FC<{rating: number, onRatingChange: (rating: number) => void}> = ({ rating, onRatingChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={`transition-colors ${
              star <= rating ? 'text-[#085F60]' : 'text-gray-300'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => refetch()} 
              className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Equalizações</h1>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por colaboradores"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
            />
          </div>
          <button className="bg-[#085F60] p-3 rounded-lg text-white hover:bg-[#064b4c] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Colaboradores */}
      <div className="space-y-4">
        {filteredCollaborators.map((collaborator) => (
          <div key={collaborator.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header do Card */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCardExpansion(collaborator.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                    {collaborator.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{collaborator.name}</h3>
                    <p className="text-sm text-gray-500">{collaborator.role}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    editingCollaborators.includes(collaborator.id) 
                      ? 'bg-orange-100 text-orange-800' 
                      : collaborator.statusColor
                  }`}>
                    {editingCollaborators.includes(collaborator.id) ? 'Editando' : collaborator.status}
                  </span>
                </div>
                
                {/* Notas resumidas */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Autoavaliação</div>
                    <div className="font-medium">{collaborator.selfAssessment || '--'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Avaliação 360</div>
                    <div className="font-medium">{collaborator.assessment360 || '--'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Nota gestor</div>
                    <div className="font-medium">{collaborator.managerAssessment || '--'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Nota final</div>
                    <div className="font-medium">
                      {collaborator.finalScore ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#085F60] text-white">
                          {collaborator.finalScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo Expandido */}
            {expandedCards.includes(collaborator.id) && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4">
                  {/* Barras de Progresso */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Autoavaliação</span>
                        <span className="text-sm font-medium text-[#085F60]">{collaborator.selfAssessment || 0}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-[#085F60] rounded-full"
                          style={{ width: `${((collaborator.selfAssessment || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Avaliação Gestor</span>
                        <span className="text-sm font-medium text-[#085F60]">{collaborator.managerAssessment || 0}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-[#085F60] rounded-full"
                          style={{ width: `${((collaborator.managerAssessment || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Avaliação 360</span>
                        <span className="text-sm font-medium text-[#085F60]">{collaborator.assessment360 || 0}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-[#085F60] rounded-full"
                          style={{ width: `${((collaborator.assessment360 || 0) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="mb-6">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Resumo</p>
                        <p className="text-sm text-blue-800">{collaborator.summary}</p>
                      </div>
                    </div>
                  </div>

                  {collaborator.status === 'Pendente' || editingCollaborators.includes(collaborator.id) ? (
                    <>
                      {/* Sistema de Avaliação */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">Dê uma avaliação de 1 a 5</p>
                        <StarRating 
                          rating={ratings[collaborator.id] || 0}
                          onRatingChange={(rating) => handleRatingChange(collaborator.id, rating)}
                        />
                      </div>

                      {/* Campo de Justificativa */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Justifique sua nota
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Justifique sua nota"
                          value={justifications[collaborator.id] || ''}
                          onChange={(e) => handleJustificationChange(collaborator.id, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex justify-end gap-3">
                        {editingCollaborators.includes(collaborator.id) && (
                          <button 
                            onClick={() => handleCancelEdit(collaborator.id)}
                            disabled={actionLoading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                          {actionLoading ? 'Salvando...' : 
                           editingCollaborators.includes(collaborator.id) ? 'Salvar Alterações' : 'Concluir'}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Colaborador Finalizado */
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Avaliação concluída com nota </span>
                          <span className="font-semibold text-[#085F60]">{collaborator.finalScore}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCopyResult(collaborator)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Copiar resultado"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <ExportButton
                          collaboratorId={collaborator.id}
                          collaboratorName={collaborator.name}
                          hasCommitteeAssessment={collaborator.status === 'Finalizado'}
                          variant="button"
                        />
                        <button 
                          onClick={() => handleEditResult(collaborator)}
                          className="flex items-center gap-2 px-4 py-2 border border-[#085F60] text-[#085F60] rounded-lg hover:bg-[#085F60] hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Editar resultado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EqualizacoesPage; 