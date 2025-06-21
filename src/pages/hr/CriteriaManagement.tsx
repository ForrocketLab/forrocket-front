import React, { useState, useEffect } from 'react';
import CriteriaService, { type Criterion, type CreateCriterionDto, type UpdateCriterionDto } from '../../services/CriteriaService';
import { useGlobalToast } from '../../hooks/useGlobalToast';

const CriteriaManagement: React.FC = () => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [filteredCriteria, setFilteredCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState<Criterion | null>(null);
  const [editForm, setEditForm] = useState<UpdateCriterionDto>({});
  const { error: showToast } = useGlobalToast();

  useEffect(() => {
    loadCriteria();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [criteria, searchTerm, selectedPillar]);

  // Fechar edição com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingCriterion) {
          handleCancelEdit();
        }
        if (showDeleteModal) {
          cancelDelete();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingCriterion, showDeleteModal]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const data = await CriteriaService.getAllCriteria();
      console.log('✅ Critérios carregados:', data.length, 'em', new Date().toLocaleTimeString());
      setCriteria(data);
    } catch (error) {
      console.error('Erro ao carregar critérios:', error);
      showToast('Erro ao carregar critérios');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...criteria];

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(criterion =>
        criterion.name.toLowerCase().includes(searchLower) ||
        criterion.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por pilar
    if (selectedPillar) {
      filtered = filtered.filter(criterion => criterion.pillar === selectedPillar);
    }

    setFilteredCriteria(filtered);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      CriteriaService.clearCache();
      const data = await CriteriaService.refreshCriteria();
      console.log('🔄 Critérios atualizados:', data.length, 'em', new Date().toLocaleTimeString());
      setCriteria(data);
      showToast('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar critérios:', error);
      showToast('Erro ao atualizar critérios');
    } finally {
      setLoading(false);
    }
  };

  const toggleCriterionExpansion = (id: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCriteria(newExpanded);
  };

  const toggleRequired = async (criterion: Criterion) => {
    try {
      await CriteriaService.toggleRequired(criterion.id);
      await loadCriteria();
      showToast(`Critério "${criterion.name}" ${criterion.isRequired ? 'marcado como opcional' : 'marcado como obrigatório'}`);
    } catch (error: any) {
      console.error('Erro ao alterar obrigatoriedade:', error);
      showToast(error.message || 'Erro ao alterar obrigatoriedade');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPillar('');
  };

  const handleEditCriterion = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    setEditForm({
      name: criterion.name,
      description: criterion.description,
      pillar: criterion.pillar,
      weight: criterion.weight,
      isRequired: criterion.isRequired
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCriterion) return;

    try {
      setLoading(true);
      await CriteriaService.updateCriterion(editingCriterion.id, editForm);
      await loadCriteria();
      setEditingCriterion(null);
      setEditForm({});
      showToast('Critério atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar critério:', error);
      showToast(error.message || 'Erro ao atualizar critério');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCriterion(null);
    setEditForm({});
  };

  const handleDeleteCriterion = (criterion: Criterion) => {
    setCriterionToDelete(criterion);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!criterionToDelete) return;

    try {
      setLoading(true);
      await CriteriaService.deleteCriterion(criterionToDelete.id);
      await loadCriteria();
      setShowDeleteModal(false);
      setCriterionToDelete(null);
      showToast('Critério removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover critério:', error);
      showToast(error.message || 'Erro ao remover critério');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCriterionToDelete(null);
  };

  const groupedCriteria = filteredCriteria.reduce((acc, criterion) => {
    const pillarName = CriteriaService.getPillarDisplayName(criterion.pillar);
    if (!acc[pillarName]) {
      acc[pillarName] = [];
    }
    acc[pillarName].push(criterion);
    return acc;
  }, {} as Record<string, Criterion[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Critérios de Avaliação</h1>
            <p className="text-gray-600 mt-1">Gerencie os critérios usados nas avaliações de desempenho</p>
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Critério
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Busca */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar critérios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Pilar */}
            <div className="min-w-48">
              <select
                value={selectedPillar}
                onChange={(e) => setSelectedPillar(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Unidade</option>
                <option value="BEHAVIOR">Comportamento</option>
                <option value="EXECUTION">Execução</option>
                <option value="MANAGEMENT">Gestão</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex gap-6">
          {/* Lista de Trilhas/Pilares */}
          <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Trilha</h2>
            </div>
            <div className="p-4 space-y-2">
              {Object.keys(groupedCriteria).map((pillarName) => (
                <button
                  key={pillarName}
                  onClick={() => setSelectedPillar(pillarName === 'Comportamento' ? 'BEHAVIOR' : pillarName === 'Execução' ? 'EXECUTION' : 'MANAGEMENT')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedPillar === (pillarName === 'Comportamento' ? 'BEHAVIOR' : pillarName === 'Execução' ? 'EXECUTION' : 'MANAGEMENT')
                      ? 'bg-teal-100 text-teal-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pillarName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Critérios */}
          <div className="flex-1 min-w-0">
            {Object.entries(groupedCriteria).map(([pillarName, pillarCriteria]) => (
              <div key={pillarName} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {pillarName}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </h3>
                </div>

                <div className="space-y-4">
                  {pillarCriteria.map((criterion) => (
                    <div key={criterion.id} className={`bg-white rounded-lg border shadow-sm transition-all ${
                      editingCriterion?.id === criterion.id 
                        ? 'border-teal-300 ring-2 ring-teal-100' 
                        : 'border-gray-200'
                    }`}>
                      <div className="p-4">
                        {editingCriterion?.id === criterion.id ? (
                          // Modo de edição
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                  type="text"
                                  value={editForm.name || ''}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                  value={editForm.description || ''}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilar</label>
                                  <select
                                    value={editForm.pillar || ''}
                                    onChange={(e) => setEditForm({...editForm, pillar: e.target.value as any})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  >
                                    <option value="BEHAVIOR">Comportamento</option>
                                    <option value="EXECUTION">Execução</option>
                                    <option value="MANAGEMENT">Gestão</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (%)</label>
                                  <input
                                    type="number"
                                    min="10"
                                    max="500"
                                    step="10"
                                    value={Math.round((editForm.weight || 1) * 100)}
                                    onChange={(e) => setEditForm({...editForm, weight: parseInt(e.target.value) / 100})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`required-${criterion.id}`}
                                  checked={editForm.isRequired || false}
                                  onChange={(e) => setEditForm({...editForm, isRequired: e.target.checked})}
                                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor={`required-${criterion.id}`} className="ml-2 text-sm text-gray-700">
                                  Campo obrigatório
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                              <button
                                onClick={handleSaveEdit}
                                disabled={loading}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                              >
                                {loading ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-medium text-gray-900">{criterion.name}</h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CriteriaService.getPillarColor(criterion.pillar)}`}>
                                    {CriteriaService.getPillarDisplayName(criterion.pillar)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Peso {Math.round(criterion.weight * 100)}%
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{criterion.description}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-600 mr-2">Campo obrigatório</span>
                                  <button
                                    onClick={() => toggleRequired(criterion)}
                                    disabled={loading}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                      criterion.isRequired ? 'bg-teal-600' : 'bg-gray-200'
                                    }`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      criterion.isRequired ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                  </button>
                                </div>
                                <button
                                  onClick={() => toggleCriterionExpansion(criterion.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <svg
                                    className={`w-5 h-5 transform transition-transform ${
                                      expandedCriteria.has(criterion.id) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {expandedCriteria.has(criterion.id) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                  <div>
                                    <span className="text-gray-500">Criado em:</span>
                                    <span className="ml-2 text-gray-900">
                                      {new Date(criterion.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Atualizado em:</span>
                                    <span className="ml-2 text-gray-900">
                                      {new Date(criterion.updatedAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditCriterion(criterion)}
                                    disabled={loading}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCriterion(criterion)}
                                    disabled={loading}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredCriteria.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">Nenhum critério encontrado</div>
                <p className="text-gray-400">Tente ajustar os filtros para encontrar critérios.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelDelete();
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Tem certeza que deseja remover o critério <strong>"{criterionToDelete?.name}"</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Esta ação não pode ser desfeita. O critério será removido permanentemente.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={loading}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaManagement; 