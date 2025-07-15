import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ClimateService, { 
  ClimateAssessmentConfig as ClimateConfig, 
  ClimateAssessmentStats 
} from '../../services/ClimateService';
import HRService from '../../services/HRService';
import ClimateSentimentAnalysisCard from '../ClimateSentimentAnalysisCard';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Settings,
  RefreshCw,
  AlertCircle,
  Play,
  Square,
  Info,
  Heart,
  Users2,
  Award,
  Workflow,
  X,
  HelpCircle
} from 'lucide-react';

const ClimateAssessmentConfig: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ClimateConfig | null>(null);
  const [stats, setStats] = useState<ClimateAssessmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [cycles, setCycles] = useState<string[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [activeCycle, setActiveCycle] = useState<string | null>(null);
  const [activeCycleName, setActiveCycleName] = useState<string | null>(null);

  // Função utilitária para formatar datas
  const formatDate = (dateValue: string | undefined): string => {
    if (!dateValue) return 'Data não disponível';
    
    try {
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateValue);
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, dateValue);
      return 'Erro na data';
    }
  };

  // Remover renderização de mensagem elegante e dropdown de ciclos passados
  // Sempre mostrar apenas o ciclo atual (primeiro da lista)
  useEffect(() => {
    const loadCycles = async () => {
      try {
        const cyclesList = await ClimateService.getClimateCycles();
        setCycles(cyclesList);
        if (cyclesList.length > 0) {
          setSelectedCycle(cyclesList[0]);
        }
      } catch (err) {
        setCycles([]);
      }
    };
    loadCycles();
  }, []);

  // Carregar configuração e estatísticas do ciclo selecionado
  useEffect(() => {
    const loadData = async () => {
      if (!selectedCycle) return;
      try {
        setLoading(true);
        setError(null);
        // Buscar config do ciclo selecionado
        const configData = await ClimateService.getClimateAssessmentConfig();
        setConfig(configData && configData.cycle === selectedCycle ? configData : null);
        // Buscar stats do ciclo selecionado
        const statsData = await ClimateService.getClimateAssessmentStatsByCycle(selectedCycle);
        setStats(statsData);
      } catch (err) {
        setError('Erro ao carregar dados do ciclo selecionado');
        setConfig(null);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCycle]);

  // Ativar/Desativar avaliação
  const toggleAssessment = async (isActive: boolean) => {
    try {
      setSaving(true);
      setError(null);
      
      const newConfig = await ClimateService.configureClimateAssessment(isActive);
      setConfig(newConfig);
      
      // Sempre recarregar estatísticas após ativar/desativar
      try {
        const newStats = await ClimateService.getClimateAssessmentStats();
        setStats(newStats);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setStats(null);
      }
      
      console.log(`Avaliação de clima ${isActive ? 'ativada' : 'desativada'} com sucesso`);
    } catch (err) {
      console.error('Erro ao configurar avaliação de clima:', err);
      setError('Erro ao configurar avaliação de clima organizacional');
    } finally {
      setSaving(false);
    }
  };

  // Recarregar estatísticas
  const refreshStats = async () => {
    try {
      setError(null);
      const newStats = await ClimateService.getClimateAssessmentStats();
      setStats(newStats);
    } catch (err) {
      console.error('Erro ao recarregar estatísticas:', err);
      setError('Erro ao recarregar estatísticas');
    }
  };

  // Renderização do dropdown de ciclo único (apenas ciclo atual)
  const renderCycleDropdown = () => (
    <div className="flex items-center gap-2 mt-2 mb-6">
      <label htmlFor="cycle-select" className="text-sm font-medium text-gray-700">
        Ciclo:
      </label>
      <select
        id="cycle-select"
        value={selectedCycle || ''}
        disabled
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
      >
        {cycles.map(cycle => (
          <option key={cycle} value={cycle}>
            {cycle}
          </option>
        ))}
      </select>
    </div>
  );

  // Renderização principal: sempre mostrar cards se houver dados, senão mensagem padrão de erro
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header sem dropdown de ciclo */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Clima Organizacional
            </h1>
            <p className="text-gray-600 mt-1">
              Configure e monitore a avaliação de clima organizacional
            </p>
            {/* Dropdown removido */}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCriteriaModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Critérios</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Sistema de Clima</span>
            </div>
          </div>
        </div>
      </div>
      {/* Cards de estatísticas e análise de sentimento como antes */}
      {/* Controles de Ativação */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Controles de Ativação
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => toggleAssessment(true)}
            disabled={saving || config?.isActive}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {saving ? 'Ativando...' : 'Ativar Avaliação'}
          </button>
          
          <button
            onClick={() => toggleAssessment(false)}
            disabled={saving || !config?.isActive}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {saving ? 'Desativando...' : 'Desativar Avaliação'}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Como funciona</p>
              <p className="text-sm text-blue-700">
                Quando ativada, a avaliação de clima organizacional será disponibilizada para os colaboradores. Eles poderão responder 4 critérios com notas de 1 a 5 
                e justificativas obrigatórias.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Status da Avaliação
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            config?.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {config?.isActive ? 'Ativa' : 'Inativa'}
          </div>
        </div>
        
        {config ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ciclo Atual</p>
                <p className="text-lg font-bold text-blue-600">{config.cycle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Configurado por</p>
                <p className="text-lg font-bold text-purple-600">{config.activatedByUserName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
                                  <div>
                <p className="text-sm font-medium text-gray-900">
                  {config.isActive ? 'Ativada em' : 'Desativada em'}
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {formatDate(config.isActive ? config.activatedAt : (config.deactivatedAt || config.activatedAt))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhuma configuração encontrada para o ciclo atual</p>
          </div>
        )}
      </div>

        {/* Estatísticas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Estatísticas da Avaliação
          </h2>
          <button
            onClick={refreshStats}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
        
        {stats ? (
          <>
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{stats.eligibleUsers}</div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-blue-900">Colaboradores</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{stats.submittedAssessments}</div>
                    <div className="text-sm text-green-700">Submetidas</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-green-900">Avaliações Finalizadas</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">{stats.draftAssessments}</div>
                    <div className="text-sm text-yellow-700">Rascunhos</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-yellow-900">Avaliações Pendentes</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</div>
                    <div className="text-sm text-purple-700">Taxa</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-purple-900">Taxa de Participação</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                <span className="text-sm font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{stats.submittedAssessments} de {stats.eligibleUsers} pessoas</span>
                <span>{stats.eligibleUsers - stats.submittedAssessments} pendentes</span>
              </div>
            </div>

            {/* Estatísticas por critério */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Média por Critério</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stats.criteriaStats).map(([criterion, data]) => (
                  <div key={criterion} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {criterion.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {data.average.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                        style={{ width: `${(data.average / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{data.count} respostas</span>
                      <span>Máx: 5.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhuma estatística disponível para o ciclo atual</p>
          </div>
                    )}
      </div>



      {/* Análise de Sentimento */}
      <div className="mt-8">
        <ClimateSentimentAnalysisCard bordered />
      </div>

      {/* Modal de Critérios */}
      {showCriteriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-indigo-600" />
                Critérios da Avaliação de Clima Organizacional
              </h2>
              <button 
                onClick={() => setShowCriteriaModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Introdução */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Sobre a Avaliação</p>
                    <p className="text-sm text-blue-700">
                      A avaliação de clima organizacional é uma pesquisa rápida e customizada que mede 
                      a satisfação e percepção sobre diferentes aspectos do ambiente de trabalho. 
                      Cada critério deve ser avaliado com uma nota de 1 a 5 e uma justificativa obrigatória.
                    </p>
                  </div>
                </div>
              </div>

              {/* Critérios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critérios de Avaliação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Relacionamento com a Liderança</h4>
                      <p className="text-sm text-red-700 leading-relaxed mb-3">
                        Avalia a qualidade da comunicação, feedback, suporte e desenvolvimento 
                        proporcionado pela liderança direta.
                      </p>
                      <div className="text-xs text-red-600 font-medium">
                        <strong>Inclui:</strong> Clareza de expectativas, reconhecimento, 
                        oportunidades de crescimento e suporte ao desenvolvimento.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Relacionamento com Colegas</h4>
                      <p className="text-sm text-blue-700 leading-relaxed mb-3">
                        Mede a colaboração, respeito e trabalho em equipe entre os membros 
                        da organização.
                      </p>
                      <div className="text-xs text-blue-600 font-medium">
                        <strong>Inclui:</strong> Ambiente de cooperação, comunicação 
                        interpessoal, espírito de equipe e respeito mútuo.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Reconhecimento e Valorização</h4>
                      <p className="text-sm text-yellow-700 leading-relaxed mb-3">
                        Avalia como a organização reconhece e valoriza o trabalho dos 
                        colaboradores.
                      </p>
                      <div className="text-xs text-yellow-600 font-medium">
                        <strong>Inclui:</strong> Feedback positivo, oportunidades de 
                        desenvolvimento, políticas de reconhecimento e valorização do trabalho.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Workflow className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Carga de Trabalho e Equilíbrio</h4>
                      <p className="text-sm text-green-700 leading-relaxed mb-3">
                        Mede o equilíbrio entre vida profissional e pessoal, gestão de 
                        tempo e pressão no trabalho.
                      </p>
                      <div className="text-xs text-green-600 font-medium">
                        <strong>Inclui:</strong> Gestão de tempo, pressão no trabalho, 
                        sustentabilidade da carga e equilíbrio vida profissional/pessoal.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escala de Avaliação */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Escala de Avaliação</h3>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-900 mb-2">Como Avaliar</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-700">
                        <div>
                          <strong>1 - Muito Insatisfeito:</strong> Aspecto muito negativo, precisa de atenção imediata
                        </div>
                        <div>
                          <strong>2 - Insatisfeito:</strong> Aspecto negativo, precisa de melhorias
                        </div>
                        <div>
                          <strong>3 - Neutro:</strong> Aspecto regular, nem bom nem ruim
                        </div>
                        <div>
                          <strong>4 - Satisfeito:</strong> Aspecto positivo, funciona bem
                        </div>
                        <div>
                          <strong>5 - Muito Satisfeito:</strong> Aspecto excelente, funciona perfeitamente
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-indigo-100 rounded-lg">
                        <p className="text-xs font-medium text-indigo-800">
                          <strong>Importante:</strong> Todas as avaliações devem incluir uma justificativa 
                          obrigatória para fundamentar a nota atribuída.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateAssessmentConfig; 