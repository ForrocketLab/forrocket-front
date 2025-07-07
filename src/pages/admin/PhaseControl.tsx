import React, { useState, useEffect } from 'react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AdminService, { 
  type CycleData, 
  type UpdateCyclePhaseData
} from '../../services/AdminService';
import { 
  Zap, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Users,
  Shield
} from 'lucide-react';

const PhaseControl: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadActiveCycle();
  }, []);

  const loadActiveCycle = async () => {
    try {
      setLoading(true);
      const cycleData = await AdminService.getActiveCycle();
      console.log('✅ Ciclo ativo carregado:', cycleData);
      setActiveCycle(cycleData);
    } catch (error) {
      console.error('Erro ao carregar ciclo ativo:', error);
      if (error instanceof Error && error.message.includes('Não há nenhum ciclo')) {
        setActiveCycle(null);
      } else {
        showErrorToast('Erro ao carregar ciclo ativo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhase = async (newPhase: UpdateCyclePhaseData['phase']) => {
    if (!activeCycle) return;

    try {
      setUpdateLoading(true);
      const updatedCycle = await AdminService.updateCyclePhase(activeCycle.id, { phase: newPhase });
      console.log('✅ Fase do ciclo atualizada:', updatedCycle);
      
      setActiveCycle(updatedCycle);
      showSuccessToast(`Fase alterada para ${getPhaseLabel(newPhase)} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar fase do ciclo:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao atualizar fase do ciclo');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'MANAGER_REVIEWS': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'EQUALIZATION': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': return <Users className="h-5 w-5" />;
      case 'MANAGER_REVIEWS': return <Shield className="h-5 w-5" />;
      case 'EQUALIZATION': return <Calendar className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': return 'Avaliações';
      case 'MANAGER_REVIEWS': return 'Gestores';
      case 'EQUALIZATION': return 'Equalização';
      default: return phase;
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'ASSESSMENTS': 
        return 'Fase onde colaboradores fazem autoavaliação, avaliação 360, mentoring e referência. Gestores ainda não podem fazer avaliações.';
      case 'MANAGER_REVIEWS': 
        return 'Fase onde apenas gestores podem fazer avaliações de seus liderados. Outras avaliações ficam bloqueadas.';
      case 'EQUALIZATION': 
        return 'Fase de equalização onde o comitê revisa e ajusta as avaliações finais. Todas as outras avaliações são bloqueadas.';
      default: 
        return 'Fase não reconhecida.';
    }
  };

  const getAvailablePhases = () => {
    if (!activeCycle) return [];
    
    const allPhases = [
      { key: 'ASSESSMENTS', label: 'Avaliações', icon: Users },
      { key: 'MANAGER_REVIEWS', label: 'Gestores', icon: Shield },
      { key: 'EQUALIZATION', label: 'Equalização', icon: Calendar }
    ];

    return allPhases;
  };

  const getNextPhase = () => {
    if (!activeCycle) return null;
    return AdminService.getNextPhase(activeCycle.phase);
  };

  const isPhaseTransitionValid = (newPhase: string) => {
    if (!activeCycle) return false;
    return AdminService.validatePhaseTransition(activeCycle.phase, newPhase);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!activeCycle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-7 w-7 text-teal-600" />
            Controle de Fases
          </h1>
          <p className="text-gray-600 mt-1">
            Controle avançado das fases do ciclo de avaliação
          </p>
        </div>

        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ciclo ativo</h3>
          <p className="text-gray-500 mb-6">
            Não há nenhum ciclo de avaliação ativo no momento.<br />
            É necessário ativar um ciclo para controlar suas fases.
          </p>
          <button
            onClick={loadActiveCycle}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Verificar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-7 w-7 text-teal-600" />
              Controle de Fases
            </h1>
            <p className="text-gray-600 mt-1">
              Controle avançado das fases do ciclo de avaliação - Ciclo {activeCycle.name}
            </p>
          </div>
          <button
            onClick={loadActiveCycle}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">⚠️ Atenção - Funcionalidade Administrativa</h3>
            <p className="text-sm text-red-700 mt-1">
              Esta funcionalidade permite alterar fases do ciclo independente de deadlines ou regras automáticas. 
              Use apenas em situações emergenciais ou para correções administrativas. 
              Mudanças de fase afetam quais tipos de avaliação ficam disponíveis para os usuários.
            </p>
          </div>
        </div>
      </div>

      {/* Current Cycle Status */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Atual do Ciclo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Nome do Ciclo</h3>
            <p className="text-xl font-bold text-gray-900">{activeCycle.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Fase Atual</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getPhaseColor(activeCycle.phase)}`}>
              {getPhaseIcon(activeCycle.phase)}
              <span className="font-medium">{getPhaseLabel(activeCycle.phase)}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-600 border border-green-200">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Ativo</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição da Fase Atual</h4>
          <p className="text-sm text-gray-600">{getPhaseDescription(activeCycle.phase)}</p>
        </div>
      </div>

      {/* Phase Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Controlar Fases</h2>
        
        {/* Quick Next Phase */}
        {getNextPhase() && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800 mb-1">Próxima Fase Sugerida</h3>
                <p className="text-sm text-green-700">
                  Avançar para: <strong>{getPhaseLabel(getNextPhase()!)}</strong>
                </p>
              </div>
              <button
                onClick={() => handleUpdatePhase(getNextPhase()! as UpdateCyclePhaseData['phase'])}
                disabled={updateLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updateLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* All Phases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getAvailablePhases().map((phase) => {
            const isCurrentPhase = activeCycle.phase === phase.key;
            const isValidTransition = isPhaseTransitionValid(phase.key);
            const canTransition = !isCurrentPhase && (isValidTransition || phase.key === activeCycle.phase);
            
            return (
              <div
                key={phase.key}
                className={`p-4 border rounded-lg transition-all ${
                  isCurrentPhase 
                    ? `${getPhaseColor(phase.key)} border-2` 
                    : canTransition 
                      ? 'border-gray-200 hover:border-teal-200 hover:bg-teal-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <phase.icon className={`h-5 w-5 ${isCurrentPhase ? '' : 'text-gray-600'}`} />
                  <h3 className={`font-medium ${isCurrentPhase ? '' : 'text-gray-900'}`}>
                    {phase.label}
                  </h3>
                  {isCurrentPhase && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                </div>
                
                <p className={`text-sm mb-4 ${isCurrentPhase ? '' : 'text-gray-600'}`}>
                  {getPhaseDescription(phase.key)}
                </p>
                
                {isCurrentPhase ? (
                  <div className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Fase Atual
                  </div>
                ) : canTransition ? (
                  <button
                    onClick={() => handleUpdatePhase(phase.key as UpdateCyclePhaseData['phase'])}
                    disabled={updateLoading}
                    className="w-full px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    Mudar para esta fase
                  </button>
                ) : (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Transição não permitida
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Flow Diagram */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Fluxo de Fases</h2>
        
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {/* Assessments */}
            <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${
              activeCycle.phase === 'ASSESSMENTS' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <Users className={`h-8 w-8 mb-2 ${
                activeCycle.phase === 'ASSESSMENTS' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                activeCycle.phase === 'ASSESSMENTS' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Avaliações
              </span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            {/* Manager Reviews */}
            <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${
              activeCycle.phase === 'MANAGER_REVIEWS' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200'
            }`}>
              <Shield className={`h-8 w-8 mb-2 ${
                activeCycle.phase === 'MANAGER_REVIEWS' ? 'text-orange-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                activeCycle.phase === 'MANAGER_REVIEWS' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                Gestores
              </span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            {/* Equalization */}
            <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${
              activeCycle.phase === 'EQUALIZATION' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200'
            }`}>
              <Calendar className={`h-8 w-8 mb-2 ${
                activeCycle.phase === 'EQUALIZATION' ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                activeCycle.phase === 'EQUALIZATION' ? 'text-purple-600' : 'text-gray-600'
              }`}>
                Equalização
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            O fluxo normal segue esta sequência, mas como administrador você pode alterar para qualquer fase quando necessário.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhaseControl; 