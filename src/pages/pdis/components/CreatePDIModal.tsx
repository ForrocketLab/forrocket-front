import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import PDIService from '../../../services/PDIService';
import type { CreatePDIDto, CreatePDIActionDto } from '../../../types/pdis';
import { getPriorityOptions, PDIPriority } from '../../../types/pdis';

interface CreatePDIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPDICreated: () => void;
}

const CreatePDIModal: React.FC<CreatePDIModalProps> = ({
  isOpen,
  onClose,
  onPDICreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePDIDto>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actions: []
  });

  const toast = useGlobalToast();
  const priorityOptions = getPriorityOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Campos obrigatórios', 'Por favor, preencha título e descrição.');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('Ações necessárias', 'Adicione pelo menos uma ação ao PDI.');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      toast.error('Datas inválidas', 'A data de término deve ser posterior à data de início.');
      return;
    }

    setLoading(true);
    try {
      const pdiData: CreatePDIDto = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        actions: formData.actions.map(action => ({
          ...action,
          deadline: new Date(action.deadline).toISOString()
        }))
      };

      await PDIService.createPDI(pdiData);
      toast.success('PDI criado!', 'Seu Plano de Desenvolvimento Individual foi criado com sucesso.');
      onPDICreated();
      resetForm();
    } catch (error) {
      console.error('Erro ao criar PDI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar PDI';
      toast.error('Erro ao criar PDI', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actions: []
    });
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-900">Criar Novo PDI</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                  placeholder="Ex: Desenvolvimento em Liderança"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                  placeholder="Descreva os objetivos e escopo do seu plano de desenvolvimento..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ações do PDI</h3>
                <button
                  type="button"
                  onClick={addAction}
                  className="bg-[#085F60] hover:bg-[#064247] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Ação
                </button>
              </div>

              {formData.actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma ação adicionada ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Ação" para começar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.actions.map((action, index) => (
                    <div key={index} className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Ação {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeAction(index)}
                          className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título da Ação *
                          </label>
                          <input
                            type="text"
                            value={action.title}
                            onChange={(e) => updateAction(index, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                            placeholder="Ex: Curso de Gestão de Equipes"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                          </label>
                          <textarea
                            value={action.description}
                            onChange={(e) => updateAction(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                            placeholder="Descreva os detalhes desta ação..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prazo *
                            </label>
                            <input
                              type="date"
                              value={action.deadline}
                              onChange={(e) => updateAction(index, 'deadline', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prioridade
                            </label>
                            <select
                              value={action.priority}
                              onChange={(e) => updateAction(index, 'priority', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
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
          </form>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || formData.actions.length === 0 || !formData.title || !formData.description}
            className="bg-[#085F60] hover:bg-[#064247] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar PDI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePDIModal; 