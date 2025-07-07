import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, BookOpen, CheckCircle, Clock, AlertCircle, Archive, MoreVertical, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import PDIService from '../../services/PDIService';
import type { PDIResponse, PDIActionResponse } from '../../types/pdis';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getProgressColor, getActionStatusOptions } from '../../types/pdis';

const PDIDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdi, setPdi] = useState<PDIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState<string | null>(null);
  const toast = useGlobalToast();

  useEffect(() => {
    if (id) {
      fetchPDI();
    }
  }, [id]);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setOpenActionMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  const fetchPDI = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await PDIService.getPDIById(id);
      setPdi(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar PDI';
      setError(errorMessage);
      toast.error('Erro ao carregar PDI', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/pdis/${id}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/pdis');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActionStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'BLOCKED':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Archive className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-white" />;
      case 'NOT_STARTED':
        return <Target className="w-5 h-5 text-white" />;
      case 'ARCHIVED':
        return <Archive className="w-5 h-5 text-white" />;
      default:
        return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  const calculateProgress = () => {
    if (!pdi || pdi.actions.length === 0) return 0;
    const completedActions = pdi.actions.filter(action => action.status === 'COMPLETED').length;
    return Math.round((completedActions / pdi.actions.length) * 100);
  };

  const getProgressColorForBar = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isActionOverdue = (deadline: string, status: string) => {
    if (status === 'COMPLETED') return false;
    return new Date(deadline) < new Date();
  };

  const handleActionStatusChange = async (actionId: string, newStatus: string) => {
    try {
      setUpdatingAction(actionId);
      await PDIService.updateActionStatus(actionId, newStatus);
      
      // Recarrega o PDI para obter os dados atualizados
      await fetchPDI();
      
      setOpenActionMenu(null);
      toast.success('Status atualizado', 'O status da ação foi alterado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar status da ação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status da ação';
      
      // Verificar se é erro de PDI arquivado
      if (errorMessage.includes('arquivado')) {
        toast.error('PDI Arquivado', 'Este PDI está arquivado e não pode ser alterado. Desarquive-o primeiro.');
      } else {
        toast.error('Erro ao atualizar status', errorMessage);
      }
    } finally {
      setUpdatingAction(null);
    }
  };

  const handleToggleActionStatus = async (actionId: string) => {
    try {
      setUpdatingAction(actionId);
      await PDIService.toggleActionStatus(actionId);
      
      // Recarrega o PDI para obter os dados atualizados
      await fetchPDI();
      
      toast.success('Status alterado', 'O status da ação foi alterado com sucesso.');
    } catch (error) {
      console.error('Erro ao alterar status da ação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status da ação';
      
      // Verificar se é erro de PDI arquivado
      if (errorMessage.includes('arquivado')) {
        toast.error('PDI Arquivado', 'Este PDI está arquivado e não pode ser alterado. Desarquive-o primeiro.');
      } else {
        toast.error('Erro ao alterar status', errorMessage);
      }
    } finally {
      setUpdatingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#085F60] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando PDI...</p>
        </div>
      </div>
    );
  }

  if (error || !pdi) {
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

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/pdis')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <button
            onClick={() => navigate(`/pdis/${pdi.id}/edit`)}
            disabled={pdi.status === 'ARCHIVED'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              pdi.status === 'ARCHIVED' 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-[#085F60] text-white hover:bg-[#064247]'
            }`}
            title={pdi.status === 'ARCHIVED' ? 'Não é possível editar PDI arquivado' : 'Editar PDI'}
          >
            <Edit className="w-4 h-4" />
            Editar PDI
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#085F60] to-[#0a7075] rounded-xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-4">{pdi.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="inline-flex items-center gap-2 text-white/90 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(pdi.startDate)} - {formatDate(pdi.endDate)}
            </span>
            <span className="inline-flex items-center gap-2 text-white bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
              {getStatusIcon(pdi.status)}
              {getStatusLabel(pdi.status)}
            </span>
            <span className="inline-flex items-center gap-2 text-white font-semibold bg-white/15 px-3 py-2 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" />
              {progress}% concluído
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/90">Progresso Geral</span>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="h-3 bg-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {pdi.description && (
            <p className="text-white/90 leading-relaxed text-lg">{pdi.description}</p>
          )}
        </div>

        {/* Alerta para PDI Arquivado */}
        {pdi.status === 'ARCHIVED' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">PDI Arquivado:</span> Este PDI está arquivado e não pode ser editado. 
                  Para fazer alterações, primeiro você precisa desarquivar o PDI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">A Fazer</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pdi.actions.filter(a => a.status === 'TO_DO').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <Archive className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Em Progresso</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pdi.actions.filter(a => a.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Concluídas</p>
                <p className="text-3xl font-bold text-green-600">
                  {pdi.actions.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bloqueadas</p>
                <p className="text-3xl font-bold text-red-600">
                  {pdi.actions.filter(a => a.status === 'BLOCKED').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Ações do PDI</h2>
          
          {pdi.actions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ação definida</h3>
              <p className="text-gray-600">Este PDI ainda não possui ações cadastradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pdi.actions.map((action: PDIActionResponse) => (
                <div
                  key={action.id}
                  className={`bg-white rounded-lg p-6 shadow-sm border transition-all duration-200 ${
                    action.status === 'COMPLETED' 
                      ? 'border-green-200 bg-green-50/50' 
                      : isActionOverdue(action.deadline, action.status)
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => handleToggleActionStatus(action.id)}
                        disabled={updatingAction === action.id || pdi.status === 'ARCHIVED'}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          pdi.status === 'ARCHIVED' 
                            ? 'cursor-not-allowed' 
                            : 'hover:bg-gray-100'
                        }`}
                        title={pdi.status === 'ARCHIVED' ? 'PDI arquivado - não é possível alterar' : 'Clique para alterar o status'}
                      >
                        {updatingAction === action.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#085F60] rounded-full" />
                        ) : (
                          getActionStatusIcon(action.status)
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${
                          action.status === 'COMPLETED' ? 'line-through text-gray-600' : ''
                        }`}>
                          {action.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {action.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Prazo: {formatDate(action.deadline)}
                              {isActionOverdue(action.deadline, action.status) && (
                                <span className="text-red-600 font-medium ml-2">
                                  (Em atraso)
                                </span>
                              )}
                            </span>
                          </div>
                          {action.completedAt && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                Concluída em {formatDate(action.completedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(action.priority)}`}>
                          {getPriorityLabel(action.priority)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(action.status)}`}>
                          {getStatusLabel(action.status)}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === action.id ? null : action.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            pdi.status === 'ARCHIVED' 
                              ? 'cursor-not-allowed opacity-50' 
                              : 'hover:bg-gray-100'
                          }`}
                          disabled={updatingAction === action.id || pdi.status === 'ARCHIVED'}
                          title={pdi.status === 'ARCHIVED' ? 'PDI arquivado - não é possível alterar' : 'Opções da ação'}
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {openActionMenu === action.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="p-2">
                              <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                                Alterar Status
                              </div>
                              {getActionStatusOptions().map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => handleActionStatusChange(action.id, option.value)}
                                  disabled={updatingAction === action.id}
                                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                                    action.status === option.value
                                      ? 'bg-[#085F60] text-white'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  } disabled:opacity-50`}
                                >
                                  {option.label}
                                  {action.status === option.value && (
                                    <span className="ml-2 text-xs">(atual)</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

export default PDIDetailsPage; 