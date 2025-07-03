import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import OKRService from '../../../services/OKRService';
import type { CreateOKRDto, CreateObjectiveDto, CreateKeyResultDto } from '../../../types/okrs';
import { getQuarterOptions, KeyResultType } from '../../../types/okrs';

interface CreateOKRModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOKRModal: React.FC<CreateOKRModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateOKRDto>({
    title: '',
    description: '',
    quarter: '2025-Q3',
    year: 2025,
    objectives: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useGlobalToast();

  const handleInputChange = (field: keyof CreateOKRDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addObjective = () => {
    const newObjective: CreateObjectiveDto = {
      title: '',
      description: '',
      keyResults: []
    };
    
    setFormData(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), newObjective]
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index) || []
    }));
  };

  const updateObjective = (index: number, field: keyof CreateObjectiveDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.map((obj, i) => 
        i === index ? { ...obj, [field]: value } : obj
      ) || []
    }));
  };

  const addKeyResult = (objectiveIndex: number) => {
    const newKeyResult: CreateKeyResultDto = {
      title: '',
      description: '',
      type: KeyResultType.PERCENTAGE,
      targetValue: 100, // Meta padrão sempre 100%
      unit: '%'
    };

    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.map((obj, i) => 
        i === objectiveIndex 
          ? { ...obj, keyResults: [...(obj.keyResults || []), newKeyResult] }
          : obj
      ) || []
    }));
  };

  const removeKeyResult = (objectiveIndex: number, keyResultIndex: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.map((obj, i) => 
        i === objectiveIndex 
          ? { ...obj, keyResults: obj.keyResults?.filter((_, j) => j !== keyResultIndex) || [] }
          : obj
      ) || []
    }));
  };

  const updateKeyResult = (
    objectiveIndex: number, 
    keyResultIndex: number, 
    field: keyof CreateKeyResultDto, 
    value: string | number | KeyResultType
  ) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.map((obj, i) => 
        i === objectiveIndex 
          ? {
              ...obj, 
              keyResults: obj.keyResults?.map((kr, j) => 
                j === keyResultIndex ? { ...kr, [field]: value } : kr
              ) || []
            }
          : obj
      ) || []
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Título é obrigatório';
    }

    // Validar objetivos
    if (!formData.objectives || formData.objectives.length === 0) {
      return 'Pelo menos um objetivo é obrigatório';
    }

    for (let i = 0; i < formData.objectives.length; i++) {
      const objective = formData.objectives[i];
      
      if (!objective.title.trim()) {
        return `Título do objetivo ${i + 1} é obrigatório`;
      }

      // Validar Key Results duplicados no mesmo objetivo
      if (objective.keyResults && objective.keyResults.length > 0) {
        const keyResultTitles = objective.keyResults.map(kr => kr.title.trim().toLowerCase());
        const duplicates = keyResultTitles.filter((title, index) => 
          title && keyResultTitles.indexOf(title) !== index
        );
        
        if (duplicates.length > 0) {
          return `Key Results duplicados encontrados no objetivo "${objective.title}". Cada Key Result deve ter um título único.`;
        }

        // Validar se todos os Key Results têm título
        for (let j = 0; j < objective.keyResults.length; j++) {
          const kr = objective.keyResults[j];
          if (!kr.title.trim()) {
            return `Título do Key Result ${j + 1} no objetivo "${objective.title}" é obrigatório`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await OKRService.createOKR(formData);
      toast.success('OKR criado com sucesso!', `O OKR "${formData.title}" foi criado com ${formData.objectives?.length || 0} objetivos.`);
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar OKR:', err);
      
      // Extrair mensagem específica do backend
      let errorMessage = 'Erro ao criar OKR';
      
      if (err instanceof AxiosError && err.response) {
        if (err.response.data?.message) {
          // Mensagem específica do backend (ex: "Já existe um OKR para 2025-Q1/2025")
          errorMessage = err.response.data.message;
        } else if (err.response.status === 409) {
          // Fallback para erro 409
          errorMessage = 'Já existe um OKR para este período. Verifique se você já possui um OKR criado para o trimestre e ano selecionados.';
        } else if (err.response.status === 400) {
          // Erro de validação
          errorMessage = 'Dados inválidos. Verifique as informações preenchidas.';
        } else if (err.response.status === 401) {
          // Token inválido
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else {
          errorMessage = `Erro HTTP ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-900">Criar Novo OKR</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error */}
          {error && (
            <div className="bg-red-100/80 border border-red-400/50 text-red-700 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título do OKR *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm"
                placeholder="Ex: Melhorar Performance da Equipe Q1 2025"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none"
                rows={3}
                placeholder="Descreva o contexto e importância deste OKR"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trimestre
              </label>
              <select
                value={formData.quarter}
                onChange={(e) => handleInputChange('quarter', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm"
              >
                {getQuarterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm"
                min={2020}
                max={2030}
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Objetivos</h3>
              <button
                type="button"
                onClick={addObjective}
                className="bg-[#085F60] hover:bg-[#064247] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-semibold transition-all duration-200 hover:scale-105 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Adicionar Objetivo
              </button>
            </div>

            {formData.objectives?.map((objective, objIndex) => (
              <div key={objIndex} className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl mb-6 border border-gray-200/50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Objetivo {objIndex + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeObjective(objIndex)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título do Objetivo *
                    </label>
                    <input
                      type="text"
                      value={objective.title}
                      onChange={(e) => updateObjective(objIndex, 'title', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm"
                      placeholder="Ex: Aumentar a satisfação do time"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição do Objetivo
                    </label>
                    <textarea
                      value={objective.description}
                      onChange={(e) => updateObjective(objIndex, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none"
                      rows={2}
                      placeholder="Detalhe como este objetivo será alcançado"
                    />
                  </div>
                </div>

                {/* Key Results */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h5 className="text-md font-semibold text-gray-700">Key Results</h5>
                      <p className="text-xs text-gray-500">O progresso é atualizado após a criação</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addKeyResult(objIndex)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 font-medium transition-all duration-200"
                    >
                      <Plus className="h-3 w-3" />
                      KR
                    </button>
                  </div>

                  {objective.keyResults?.map((keyResult, krIndex) => (
                    <div key={krIndex} className="bg-white p-4 rounded-lg border border-gray-200/50 mb-3 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Key Result {krIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeKeyResult(objIndex, krIndex)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nome do Key Result *
                          </label>
                          <input
                            type="text"
                            value={keyResult.title}
                            onChange={(e) => updateKeyResult(objIndex, krIndex, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                            placeholder="Ex: Aumentar receita para R$ 50.000"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Descrição do Key Result
                          </label>
                          <textarea
                            value={keyResult.description || ''}
                            onChange={(e) => updateKeyResult(objIndex, krIndex, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent resize-none"
                            rows={2}
                            placeholder="Descreva como este resultado será medido..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-all duration-200 font-medium backdrop-blur-sm"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white bg-[#085F60] hover:bg-[#064247] rounded-lg transition-all duration-200 disabled:opacity-50 font-semibold shadow-md hover:scale-105 disabled:hover:scale-100"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar OKR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOKRModal; 