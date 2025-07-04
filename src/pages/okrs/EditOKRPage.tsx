import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Target, AlertTriangle } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import type { OKRResponse, ObjectiveResponse, KeyResultResponse, UpdateOKRDto, UpdateObjectiveDto, UpdateKeyResultDto, CreateObjectiveDto, CreateKeyResultDto } from '../../types/okrs';
import { KeyResultType } from '../../types/okrs';
import { ObjectiveStatus } from '../../types/okrs';
import { getQuarterOptions } from '../../types/okrs';
import OKRService from '../../services/OKRService';

interface EditObjectiveForm extends ObjectiveResponse {
  isNew?: boolean;
  isDeleted?: boolean;
}

interface EditKeyResultForm extends KeyResultResponse {
  isNew?: boolean;
  isDeleted?: boolean;
}

const EditOKRPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useGlobalToast();
  
  // Estados principais
  const [originalOKR, setOriginalOKR] = useState<OKRResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quarter, setQuarter] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [objectives, setObjectives] = useState<EditObjectiveForm[]>([]);

  useEffect(() => {
    const fetchOKR = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await OKRService.getOKRById(id);
        setOriginalOKR(response);
        
        // Preencher formulário
        setTitle(response.title);
        setDescription(response.description || '');
        setQuarter(response.quarter);
        setYear(response.year);
        setObjectives(response.objectives || []);
      } catch (err) {
        const errorMessage = 'Erro ao carregar OKR';
        setError(errorMessage);
        console.error('Error fetching OKR:', err);
        toast.error('Erro ao carregar OKR', err instanceof Error ? err.message : 'Não foi possível carregar os dados do OKR para edição.');
      } finally {
        setLoading(false);
      }
    };

    fetchOKR();
  }, [id]);

  const handleSave = async () => {
    if (!originalOKR) return;

    // Validar campos obrigatórios
    if (!title.trim()) {
      setError('Título do OKR é obrigatório');
      return;
    }

    for (let i = 0; i < objectives.length; i++) {
      const objective = objectives[i];
      if (!objective.title.trim()) {
        setError(`Título do objetivo ${i + 1} é obrigatório`);
        return;
      }

      if (objective.keyResults) {
        for (let j = 0; j < objective.keyResults.length; j++) {
          const kr = objective.keyResults[j] as EditKeyResultForm;
          if (!kr.title.trim()) {
            setError(`Título do Key Result ${j + 1} no objetivo "${objective.title}" é obrigatório`);
            return;
          }
        }
      }
    }

    try {
      setSaving(true);
      setError(null);

      // 1. Atualizar dados básicos do OKR se mudaram
      if (title !== originalOKR.title || description !== originalOKR.description || 
          quarter !== originalOKR.quarter || year !== originalOKR.year) {
        const updateData: UpdateOKRDto = {
          title: title !== originalOKR.title ? title : undefined,
          description: description !== originalOKR.description ? description : undefined,
          quarter: quarter !== originalOKR.quarter ? quarter : undefined,
          year: year !== originalOKR.year ? year : undefined,
        };
        
        await OKRService.updateOKR(originalOKR.id, updateData);
      }

      // 2. Processar objetivos
      for (const objective of objectives) {
        const editObjective = objective as EditObjectiveForm;
        if (editObjective.isNew) {
          // Criar novo objetivo
          const createObjectiveData: CreateObjectiveDto = {
            title: editObjective.title,
            description: editObjective.description,
            keyResults: editObjective.keyResults?.map(kr => {
              const editKr = kr as EditKeyResultForm;
              return {
                title: editKr.title,
                description: editKr.description,
                type: editKr.type,
                targetValue: editKr.targetValue,
                currentValue: editKr.currentValue || 0,
                unit: editKr.unit,
              };
            }) || []
          };
          
          await OKRService.createObjective(originalOKR.id, createObjectiveData);
        } else {
          // Atualizar objetivo existente
          const updateObjectiveData: UpdateObjectiveDto = {
            title: editObjective.title,
            description: editObjective.description,
          };
          
          await OKRService.updateObjective(editObjective.id, updateObjectiveData);

          // Processar key results do objetivo
          if (editObjective.keyResults) {
            for (const keyResult of editObjective.keyResults) {
              const editKeyResult = keyResult as EditKeyResultForm;
              if (editKeyResult.isNew) {
                // Criar novo key result
                const createKeyResultData: CreateKeyResultDto = {
                  title: editKeyResult.title,
                  description: editKeyResult.description,
                  type: editKeyResult.type,
                  targetValue: editKeyResult.targetValue,
                  currentValue: editKeyResult.currentValue || 0,
                  unit: editKeyResult.unit,
                };
                
                await OKRService.createKeyResult(editObjective.id, createKeyResultData);
              } else {
                // Atualizar key result existente
                const updateKeyResultData: UpdateKeyResultDto = {
                  title: editKeyResult.title,
                  description: editKeyResult.description,
                  targetValue: editKeyResult.targetValue,
                  unit: editKeyResult.unit,
                };
                
                await OKRService.updateKeyResult(editKeyResult.id, updateKeyResultData);
              }
            }
          }
        }
      }

      // Redirecionar para a página de detalhes
      toast.success('OKR atualizado com sucesso!', `Suas alterações no OKR "${title}" foram salvas.`);
      navigate(`/okrs/${originalOKR.id}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar alterações';
      setError(errorMessage);
      console.error('Error saving OKR:', err);
      toast.error('Erro ao salvar alterações', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Funções para objetivos
  const addObjective = () => {
    const newObjective: EditObjectiveForm = {
      id: `temp_${Date.now()}`,
      okrId: originalOKR?.id || '',
      title: '',
      description: '',
      status: ObjectiveStatus.NOT_STARTED,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keyResults: [],
      isNew: true,
    };
    
    setObjectives([...objectives, newObjective]);
  };

  const updateObjective = (index: number, field: keyof EditObjectiveForm, value: string) => {
    setObjectives(prev => prev.map((obj, i) => 
      i === index ? { ...obj, [field]: value } : obj
    ));
  };

  const removeObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  // Funções para key results
  const addKeyResult = (objectiveIndex: number) => {
    const newKeyResult: EditKeyResultForm = {
      id: `temp_kr_${Date.now()}`,
      objectiveId: objectives[objectiveIndex].id,
      title: '',
      description: '',
      type: KeyResultType.PERCENTAGE,
      targetValue: 100, // Meta padrão sempre 100% 
      currentValue: 0,
      unit: '%',
      status: 'NOT_STARTED' as any,
      progress: 0,
      formattedCurrentValue: '0%',
      formattedTargetValue: '100%',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    };

    setObjectives(prev => prev.map((obj, i) => 
      i === objectiveIndex 
        ? { ...obj, keyResults: [...(obj.keyResults || []), newKeyResult] }
        : obj
    ));
  };

  const updateKeyResult = (
    objectiveIndex: number, 
    keyResultIndex: number, 
    field: keyof EditKeyResultForm, 
    value: string | number
  ) => {
    setObjectives(prev => prev.map((obj, i) => 
      i === objectiveIndex 
        ? {
            ...obj, 
            keyResults: obj.keyResults?.map((kr, j) => 
              j === keyResultIndex ? { ...kr, [field]: value } : kr
            ) || []
          }
        : obj
    ));
  };

  const removeKeyResult = (objectiveIndex: number, keyResultIndex: number) => {
    setObjectives(prev => prev.map((obj, i) => 
      i === objectiveIndex 
        ? { ...obj, keyResults: obj.keyResults?.filter((_, j) => j !== keyResultIndex) || [] }
        : obj
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#085F60] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando OKR...</p>
        </div>
      </div>
    );
  }

  if (error && !originalOKR) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar OKR</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/okrs')}
            className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064247] transition-colors"
          >
            Voltar para OKRs
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
              onClick={() => navigate(`/okrs/${originalOKR?.id}`)}
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
                Editar OKR
              </h1>
              <p className="text-gray-600 text-lg mt-2">Edite seus objetivos e resultados-chave</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#085F60] text-white px-6 py-3 rounded-xl hover:bg-[#064247] transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
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

        {/* Formulário Principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#085F60]" />
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Título do OKR *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                placeholder="Ex: Aumentar engajamento dos usuários"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Trimestre *
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                required
              >
                <option value="">Selecione o trimestre</option>
                {getQuarterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ano *
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                min="2025"
                max="2030"
                required
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none transition-all duration-200"
                placeholder="Descreva o contexto e importância deste OKR..."
              />
            </div>
          </div>
        </div>

        {/* Seção de Objetivos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Target className="w-6 h-6 text-[#085F60]" />
              Objetivos
            </h2>
            <button
              onClick={addObjective}
              className="flex items-center gap-2 bg-[#085F60] text-white px-4 py-3 rounded-xl hover:bg-[#064247] transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Adicionar Objetivo
            </button>
          </div>

          {objectives.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum objetivo criado ainda</p>
              <p className="text-sm">Adicione objetivos para estruturar seu OKR</p>
            </div>
          ) : (
            <div className="space-y-6">
              {objectives.map((objective, objIndex) => (
                <div key={objective.id} className="bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-gray-800">
                      Objetivo {objIndex + 1}
                    </h4>
                    <button
                      onClick={() => removeObjective(objIndex)}
                      className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Título do Objetivo *
                      </label>
                      <input
                        type="text"
                        value={objective.title}
                        onChange={(e) => updateObjective(objIndex, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                        placeholder="Ex: Aumentar a satisfação do time"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Descrição do Objetivo
                      </label>
                      <textarea
                        value={objective.description}
                        onChange={(e) => updateObjective(objIndex, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none transition-all duration-200"
                        rows={3}
                        placeholder="Detalhe como este objetivo será alcançado"
                      />
                    </div>
                  </div>

                  {/* Key Results */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h5 className="text-lg font-bold text-gray-700">Key Results</h5>
                        <p className="text-sm text-gray-500">O progresso é atualizado na tela de detalhes</p>
                      </div>
                      <button
                        onClick={() => addKeyResult(objIndex)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-sm flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        <Plus className="h-4 w-4" />
                        KR
                      </button>
                    </div>

                    {objective.keyResults?.map((keyResult, krIndex) => (
                      <div key={keyResult.id} className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-gray-200/50 mb-4 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-gray-700 bg-gray-100/80 px-3 py-1 rounded-lg">
                            Key Result {krIndex + 1}
                          </span>
                          <button
                            onClick={() => removeKeyResult(objIndex, krIndex)}
                            className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nome do Key Result *
                            </label>
                            <input
                              type="text"
                              value={keyResult.title}
                              onChange={(e) => updateKeyResult(objIndex, krIndex, 'title', e.target.value)}
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm transition-all duration-200"
                              placeholder="Ex: Aumentar receita para R$ 50.000"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Descrição do Key Result
                            </label>
                            <textarea
                              value={keyResult.description}
                              onChange={(e) => updateKeyResult(objIndex, krIndex, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#085F60] focus:border-transparent shadow-sm resize-none transition-all duration-200"
                              rows={3}
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
        )}
        </div>
      </div>
    </div>
  );
};

export default EditOKRPage; 