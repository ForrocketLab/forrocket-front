import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreVertical, Calendar, BookOpen, Pause, Play, X, Archive, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { PDISummary } from '../../../types/pdis';
import { 
  getStatusLabel, 
  getStatusColor, 
  getProgressColor, 
  PDIStatus,
  isPDIOverdue,
  isPDINearDeadline,
  getPDIDeadlineColor,
  getPDIDeadlineStatus,
  getPDIOverdueDays
} from '../../../types/pdis';
import PDIService from '../../../services/PDIService';

interface PDICardProps {
  pdi: PDISummary;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const PDICard: React.FC<PDICardProps> = ({ pdi, onDelete, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{ status: PDIStatus; action: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useGlobalToast();

  const handleView = () => {
    navigate(`/pdis/${pdi.id}`);
  };

  const handleEdit = () => {
    navigate(`/pdis/${pdi.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleStatusChange = (status: PDIStatus, action: string) => {
    setShowStatusConfirm({ status, action });
    setShowMenu(false);
  };

  const confirmDelete = () => {
    onDelete(pdi.id);
    setShowDeleteConfirm(false);
  };

  const confirmStatusChange = async () => {
    if (!showStatusConfirm) return;
    
    try {
      setLoading(true);
      await PDIService.updatePDI(pdi.id, { status: showStatusConfirm.status });
      onRefresh();
      setShowStatusConfirm(null);
      
      const statusMessages = {
        'pausar': { title: 'PDI pausado', message: `O PDI "${pdi.title}" foi pausado com sucesso.` },
        'arquivar': { title: 'PDI arquivado', message: `O PDI "${pdi.title}" foi arquivado.` },
        'reativar': { title: 'PDI reativado', message: `O PDI "${pdi.title}" foi reativado e está ativo novamente.` },
        'concluir': { title: 'PDI concluído', message: `O PDI "${pdi.title}" foi marcado como concluído.` }
      };
      
      const message = statusMessages[showStatusConfirm.action as keyof typeof statusMessages];
      if (message) {
        toast.success(message.title, message.message);
      }
    } catch (error) {
      console.error('Erro ao alterar status do PDI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status do PDI';
      
      // Verificar se é erro de PDI arquivado
      if (errorMessage.includes('arquivado')) {
        toast.error('PDI Arquivado', 'Este PDI está arquivado e não pode ser alterado.');
      } else {
        toast.error('Erro ao alterar status', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const progressColor = getProgressColor(pdi.progressPercentage);
  const statusColor = getStatusColor(pdi.status);
  const isOverdue = isPDIOverdue(pdi);
  const isNearDeadline = isPDINearDeadline(pdi);
  const deadlineStatus = getPDIDeadlineStatus(pdi);

  const canPause = pdi.status === 'IN_PROGRESS';
  const canResume = pdi.status === 'NOT_STARTED' || pdi.status === 'ARCHIVED';
  const canComplete = pdi.status === 'IN_PROGRESS';
  const canArchive = pdi.status === 'NOT_STARTED' || pdi.status === 'IN_PROGRESS' || pdi.status === 'COMPLETED';
  const canReactivate = pdi.status === 'ARCHIVED';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg flex flex-col h-full ${
      isOverdue 
        ? 'border-2 border-red-300 hover:border-red-400' 
        : isNearDeadline 
          ? 'border-2 border-orange-300 hover:border-orange-400'
          : 'border border-gray-200 hover:border-gray-300'
    }`}>
      
      {/* Alerta de Atraso */}
      {(isOverdue || isNearDeadline) && (
        <div className={`px-4 py-2 rounded-t-xl flex items-center gap-2 ${
          isOverdue ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {deadlineStatus}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
              {pdi.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {pdi.description}
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                {formatDate(pdi.startDate)} - {formatDate(pdi.endDate)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleView}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </button>
                <button
                  onClick={handleEdit}
                  disabled={pdi.status === 'ARCHIVED'}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                    pdi.status === 'ARCHIVED' 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={pdi.status === 'ARCHIVED' ? 'Não é possível editar PDI arquivado' : 'Editar PDI'}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                {canPause && (
                  <button
                    onClick={() => handleStatusChange(PDIStatus.ARCHIVED, 'pausar')}
                    className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pausar
                  </button>
                )}
                
                {canResume && (
                  <button
                    onClick={() => handleStatusChange(PDIStatus.IN_PROGRESS, 'reativar')}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar/Reativar
                  </button>
                )}
                
                {canComplete && (
                  <button
                    onClick={() => handleStatusChange(PDIStatus.COMPLETED, 'concluir')}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Marcar como Concluído
                  </button>
                )}
                
                {canArchive && (
                  <button
                    onClick={() => handleStatusChange(PDIStatus.ARCHIVED, 'arquivar')}
                    className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </button>
                )}
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={handleDelete}
                  disabled={pdi.status === 'ARCHIVED'}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 last:rounded-b-lg ${
                    pdi.status === 'ARCHIVED' 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={pdi.status === 'ARCHIVED' ? 'Não é possível deletar PDI arquivado' : 'Deletar PDI'}
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}>
            {getStatusLabel(pdi.status)}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">{pdi.actionsCount} ações</span>
          </div>
        </div>

        <div className="mb-6 flex-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Progresso Geral</span>
            <span className="text-lg font-bold text-gray-900">
              {pdi.progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${Math.min(pdi.progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{pdi.completedActions} de {pdi.actionsCount} ações concluídas</span>
            <span>{pdi.actionsCount - pdi.completedActions} restantes</span>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={handleView}
            className="flex-1 bg-[#085F60] hover:bg-[#064247] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o PDI "{pdi.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar alteração de status
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja {showStatusConfirm.action} o PDI "{pdi.title}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowStatusConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={loading}
                className="px-4 py-2 bg-[#085F60] hover:bg-[#064247] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDICard; 