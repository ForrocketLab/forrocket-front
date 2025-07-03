import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, AlertTriangle } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import PDIService from '../../services/PDIService';
import type { CreatePDIDto, UpdatePDIDto, PDIResponse, CreatePDIActionDto, UpdatePDIActionDto } from '../../types/pdis';
import { getPriorityOptions, PDIPriority, getStatusOptions, getActionStatusOptions } from '../../types/pdis';

const PDIForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePDIDto>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actions: []
  });
  const [originalPDI, setOriginalPDI] = useState<PDIResponse | null>(null);

  const toast = useGlobalToast();
  const priorityOptions = getPriorityOptions();
  const statusOptions = getStatusOptions();
  const actionStatusOptions = getActionStatusOptions();
  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadPDI();
    }
  }, [id]);

  const loadPDI = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      setError(null);
      const data = await PDIService.getPDIById(id);
      setOriginalPDI(data);
      
      // Verificar se o PDI está arquivado
      if (data.status === 'ARCHIVED') {
        toast.error('PDI Arquivado', 'Este PDI está arquivado e não pode ser editado. Redirecionando para a visualização.');
        navigate(`/pdis/${id}`);
        return;
      }
      
      setFormData({
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: new Date(data.endDate).toISOString().split('T')[0],
        actions: data.actions.map(action => ({
          title: action.title,
          description: action.description,
          deadline: new Date(action.deadline).toISOString().split('T')[0],
          priority: action.priority
        }))
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar PDI';
      setError(errorMessage);
      toast.error('Erro ao carregar PDI', errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.title.trim()) {
      setError('Título do PDI é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      setError('Descrição do PDI é obrigatória');
      return;
    }

    if (formData.actions.length === 0) {
      setError('Adicione pelo menos uma ação ao PDI');
      return;
    }

    // Validar ações
    for (let i = 0; i < formData.actions.length; i++) {
      const action = formData.actions[i];
      if (!action.title.trim()) {
        setError(`Título da ação ${i + 1} é obrigatório`);
        return;
      }
      if (!action.description.trim()) {
        setError(`Descrição da ação ${i + 1} é obrigatória`);
        return;
      }
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      setError('A data de término deve ser posterior à data de início');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && originalPDI) {
        // Atualização
        const updateData: UpdatePDIDto = {
          title: formData.title,
          description: formData.description,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          actions: formData.actions.map((action, index) => {
            const originalAction = originalPDI.actions[index];
            return {
              id: originalAction?.id,
              title: action.title,
              description: action.description,
              deadline: new Date(action.deadline).toISOString(),
              priority: action.priority
            } as UpdatePDIActionDto;
          })
        };

        await PDIService.updatePDI(id, updateData);
        toast.success('PDI atualizado com sucesso!', `Suas alterações no PDI "${formData.title}" foram salvas.`);
        navigate(`/pdis/${id}`);
      } else {
        // Criação
        const createData: CreatePDIDto = {
          ...formData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          actions: formData.actions.map(action => ({
            title: action.title,
            description: action.description,
            deadline: new Date(action.deadline).toISOString(),
            priority: action.priority
          }))
        };

        await PDIService.createPDI(createData);
        toast.success('PDI criado com sucesso!', `Seu PDI "${formData.title}" foi criado e já está disponível.`);
        navigate('/pdis');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar PDI';
      setError(errorMessage);
      console.error('Error saving PDI:', err);
      
      // Verificar se é erro de PDI arquivado
      if (errorMessage.includes('arquivado')) {
        toast.error('PDI Arquivado', 'Este PDI está arquivado e não pode ser editado. Redirecionando para a visualização.');
        navigate(`/pdis/${id}`);
      } else {
        toast.error('Erro ao salvar PDI', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      navigate(`/pdis/${id}`);
    } else {
      navigate('/pdis');
    }
  };

  const addAction = () => {
    const newAction: CreatePDIActionDto = {
      title: '',
      description: '',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: PDIPriority.MEDIUM
    };

    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof CreatePDIActionDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#085F60] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando PDI...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar PDI</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/pdis')}
            className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064247] transition-colors"
          >
            Voltar para PDIs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          {/* Botão Voltar */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-[#085F60] transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>

          {/* Título e Botão Salvar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isEditing ? 'Editar PDI' : 'Criar Novo PDI'}
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                {isEditing 
                  ? 'Edite seu plano de desenvolvimento individual'
                  : 'Crie um novo plano de desenvolvimento individual'
                }
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || formData.actions.length === 0 || !formData.title || !formData.description}
              className="flex items-center gap-2 bg-[#085F60] text-white px-6 py-3 rounded-xl hover:bg-[#064247] transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar PDI')}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 mb-8 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Erro</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#085F60]" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Título do PDI *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                  placeholder="Ex: Desenvolvimento em Liderança e Gestão"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Data de Término *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none transition-all duration-200"
                  placeholder="Descreva os objetivos, escopo e importância deste plano de desenvolvimento..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção de Ações */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#085F60]" />
                Ações do PDI
              </h2>
              <button
                type="button"
                onClick={addAction}
                className="flex items-center gap-2 bg-[#085F60] text-white px-4 py-3 rounded-xl hover:bg-[#064247] transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adicionar Ação
              </button>
            </div>

            {formData.actions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma ação criada ainda</p>
                <p className="text-sm">Adicione ações para estruturar seu PDI</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.actions.map((action, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold text-gray-800">
                        Ação {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Título da Ação *
                        </label>
                        <input
                          type="text"
                          value={action.title}
                          onChange={(e) => updateAction(index, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                          placeholder="Ex: Curso de Gestão de Equipes"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Descrição da Ação *
                        </label>
                        <textarea
                          value={action.description}
                          onChange={(e) => updateAction(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none transition-all duration-200"
                          rows={3}
                          placeholder="Detalhe como esta ação será executada e seus resultados esperados..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Prazo *
                          </label>
                          <input
                            type="date"
                            value={action.deadline}
                            onChange={(e) => updateAction(index, 'deadline', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Prioridade
                          </label>
                          <select
                            value={action.priority}
                            onChange={(e) => updateAction(index, 'priority', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                          >
                            {priorityOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Mobile */}
          <div className="lg:hidden flex flex-col gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || formData.actions.length === 0 || !formData.title || !formData.description}
              className="w-full bg-[#085F60] hover:bg-[#064247] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar PDI' : 'Criar PDI')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDIForm; 