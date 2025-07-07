import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Target, TrendingUp, CheckCircle, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import type { OKRResponse, ObjectiveResponse, KeyResultResponse } from '../../types/okrs';
import OKRService from '../../services/OKRService';
import { formatKeyResultDisplay, getKeyResultStatusColor, getKeyResultStatusLabel, getObjectiveStatusColor, getObjectiveStatusLabel, getStatusLabel } from '../../types/okrs';
import UpdateKeyResultModal from './components/UpdateKeyResultModal';

const OKRDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [okr, setOkr] = useState<OKRResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResultResponse | null>(null);
  const toast = useGlobalToast();

  useEffect(() => {
    const fetchOKR = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await OKRService.getOKRById(id);
        setOkr(response);
      } catch (err) {
        const errorMessage = 'Erro ao carregar OKR';
        setError(errorMessage);
        console.error('Error fetching OKR:', err);
        toast.error('Erro ao carregar OKR', err instanceof Error ? err.message : 'Não foi possível carregar os detalhes do OKR.');
      } finally {
        setLoading(false);
      }
    };

    fetchOKR();
  }, [id]);

  const refreshOKR = async () => {
    if (!id) return;
    try {
      const response = await OKRService.getOKRById(id);
      setOkr(response);
      toast.success('Key Result atualizado!', 'O progresso foi atualizado com sucesso.');
    } catch (err) {
      console.error('Error refreshing OKR:', err);
      toast.error('Erro ao atualizar', 'Não foi possível atualizar os dados do OKR.');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-teal-600" />;
      case 'AT_RISK':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'NOT_STARTED':
        return <Target className="w-5 h-5 text-gray-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
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

  if (error || !okr) {
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
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/okrs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <button
            onClick={() => navigate(`/okrs/${okr.id}/edit`)}
            className="flex items-center gap-2 bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064247] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#085F60] to-[#0a7075] rounded-xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-4">{okr.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="inline-flex items-center gap-2 text-white/90 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              Q{okr.quarter}/{okr.year}
            </span>
            <span className="inline-flex items-center gap-2 text-white bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
              {getStatusIcon(okr.status)}
              {getStatusLabel(okr.status)}
            </span>
            <span className="inline-flex items-center gap-2 text-white font-semibold bg-white/15 px-3 py-2 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" />
              {okr.overallProgress}% concluído
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/90">Progresso Geral</span>
              <span className="text-sm font-bold text-white">{okr.overallProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="h-3 bg-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${okr.overallProgress}%` }}
              ></div>
            </div>
          </div>

          {okr.description && (
            <p className="text-white/90 leading-relaxed text-lg">{okr.description}</p>
          )}
        </div>

        {/* Objectives */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Objetivos</h2>
          {okr.objectives?.map((objective: ObjectiveResponse) => (
            <div key={objective.id} className="space-y-6">
              {/* Objective Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{objective.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getObjectiveStatusColor(objective.status)}`}>
                      {getObjectiveStatusLabel(objective.status)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{objective.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(objective.progress)} transition-all duration-300`}
                    style={{ width: `${objective.progress}%` }}
                  ></div>
                </div>
                {objective.description && (
                  <p className="text-gray-600 mb-6">{objective.description}</p>
                )}
              </div>

              {/* Key Results */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resultados-Chave</h4>
                <div className="space-y-4">
                  {objective.keyResults?.map((keyResult: KeyResultResponse) => (
                    <div key={keyResult.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{keyResult.title}</h5>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedKeyResult(keyResult)}
                            className="flex items-center gap-1 bg-[#085F60] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#064247] transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Atualizar
                          </button>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKeyResultStatusColor(keyResult.status)}`}>
                            {getKeyResultStatusLabel(keyResult.status)}
                          </span>
                          <span className="text-lg font-bold text-gray-900">{keyResult.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">
                          {formatKeyResultDisplay(keyResult)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(keyResult.progress)} transition-all duration-300`}
                          style={{ width: `${keyResult.progress}%` }}
                        ></div>
                      </div>
                      
                      {keyResult.description && (
                        <p className="text-sm text-gray-600">{keyResult.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Atualização de Key Result */}
        {selectedKeyResult && (
          <UpdateKeyResultModal
            keyResult={selectedKeyResult}
            onClose={() => setSelectedKeyResult(null)}
            onUpdate={refreshOKR}
          />
        )}
      </div>
    </div>
  );
};

export default OKRDetailsPage; 