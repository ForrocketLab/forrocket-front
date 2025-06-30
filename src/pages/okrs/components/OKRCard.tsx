import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreVertical, Calendar, Target, Pause, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { OKRSummary } from '../../../types/okrs';
import { getStatusLabel, getStatusColor, getProgressColor, OKRStatus } from '../../../types/okrs';
import OKRService from '../../../services/OKRService';

interface OKRCardProps {
  okr: OKRSummary;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const OKRCard: React.FC<OKRCardProps> = ({ okr, onDelete, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{ status: OKRStatus; action: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useGlobalToast();

  const handleView = () => {
    navigate(`/okrs/${okr.id}`);
  };

  const handleEdit = () => {
    navigate(`/okrs/${okr.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleStatusChange = (status: OKRStatus, action: string) => {
    setShowStatusConfirm({ status, action });
    setShowMenu(false);
  };

  const confirmDelete = () => {
    onDelete(okr.id);
    setShowDeleteConfirm(false);
  };

  const confirmStatusChange = async () => {
    if (!showStatusConfirm) return;
    
    try {
      setLoading(true);
      await OKRService.updateOKR(okr.id, { status: showStatusConfirm.status });
      onRefresh();
      setShowStatusConfirm(null);
      
      // Toast de sucesso personalizado baseado na ação
      const statusMessages = {
        'pausar': { title: 'OKR pausado', message: `O OKR "${okr.title}" foi pausado com sucesso.` },
        'cancelar': { title: 'OKR cancelado', message: `O OKR "${okr.title}" foi cancelado.` },
        'reativar': { title: 'OKR reativado', message: `O OKR "${okr.title}" foi reativado e está ativo novamente.` }
      };
      
      const message = statusMessages[showStatusConfirm.action as keyof typeof statusMessages];
      if (message) {
        toast.success(message.title, message.message);
      }
    } catch (error) {
      console.error('Erro ao alterar status do OKR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status do OKR';
      toast.error('Erro ao alterar status', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const progressColor = getProgressColor(okr.overallProgress);
  const statusColor = getStatusColor(okr.status);

  // Determinar quais ações estão disponíveis baseadas no status atual
  const canPause = okr.status === 'ACTIVE';
  const canResume = okr.status === 'PAUSED';
  const canCancel = okr.status === 'ACTIVE' || okr.status === 'PAUSED';
  const canReactivate = okr.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
              {okr.title}
            </h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">{okr.quarter} {okr.year}</span>
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
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                
                {/* Separador */}
                <div className="border-t border-gray-200 my-1"></div>
                
                {/* Opções de status */}
                {canPause && (
                  <button
                    onClick={() => handleStatusChange(OKRStatus.PAUSED, 'pausar')}
                    className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pausar
                  </button>
                )}
                
                {canResume && (
                  <button
                    onClick={() => handleStatusChange(OKRStatus.ACTIVE, 'reativar')}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Reativar
                  </button>
                )}
                
                {canCancel && (
                  <button
                    onClick={() => handleStatusChange(OKRStatus.CANCELLED, 'cancelar')}
                    className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                )}
                
                {canReactivate && (
                  <button
                    onClick={() => handleStatusChange(OKRStatus.ACTIVE, 'reativar')}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Reativar
                  </button>
                )}
                
                {/* Separador */}
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and Objectives */}
        <div className="flex items-center justify-between mb-6">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}>
            {getStatusLabel(okr.status)}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Target className="h-4 w-4" />
            <span className="font-medium">{okr.objectivesCount} objetivos</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Progresso Geral</span>
            <span className="text-lg font-bold text-gray-900">
              {okr.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${Math.min(okr.overallProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{okr.completedObjectives} de {okr.objectivesCount}</span> objetivos concluídos
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Atualizado {new Date(okr.updatedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <button
          onClick={handleView}
          className="w-full bg-[#085F60] hover:bg-[#064247] text-white py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
        >
          Ver Detalhes
        </button>
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar Alteração
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja {showStatusConfirm.action} o OKR "{okr.title}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-2 text-white bg-[#085F60]/90 hover:bg-[#064247]/90 rounded-lg transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Alterando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar o OKR "{okr.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600/90 hover:bg-red-700/90 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default OKRCard; 