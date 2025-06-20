import { type FC, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Download, Copy } from 'lucide-react';
import { useCommitteeCollaborators, useCommitteeMetrics, useCollaboratorEvaluationSummary } from '../../hooks/useCommittee';
import ExportButton from '../../components/ExportButton';
import CommitteeService from '../../services/CommitteeService';
import { useGlobalToast } from '../../hooks/useGlobalToast';

const CommitteePage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useGlobalToast();
  const [expandedCollaborators, setExpandedCollaborators] = useState<string[]>([]);
  const [collaboratorSummaries, setCollaboratorSummaries] = useState<{[key: string]: any}>({});
  const { data: collaboratorsData, loading: collaboratorsLoading, error: collaboratorsError } = useCommitteeCollaborators();
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useCommitteeMetrics();

  // Função para buscar dados de summary quando um colaborador é expandido
  const fetchCollaboratorSummary = async (collaboratorId: string) => {
    if (collaboratorSummaries[collaboratorId]) return; // Já carregado
    
    try {
      const summary = await CommitteeService.getCollaboratorEvaluationSummary(collaboratorId);
      setCollaboratorSummaries(prev => ({
        ...prev,
        [collaboratorId]: summary
      }));
    } catch (error) {
      console.error('Erro ao buscar summary do colaborador:', error);
    }
  };

  // Função para alternar expansão do colaborador
  const toggleCollaboratorExpansion = (collaboratorId: string) => {
    setExpandedCollaborators(prev => {
      const isExpanding = !prev.includes(collaboratorId);
      
      if (isExpanding) {
        fetchCollaboratorSummary(collaboratorId);
        return [...prev, collaboratorId];
      } else {
        return prev.filter(id => id !== collaboratorId);
      }
    });
  };

  // Processar dados reais do back-end
  const collaborators = collaboratorsData?.collaborators || [];
  const pendingCount = collaboratorsData?.summary.pendingEqualization || 0;
  const completedCount = collaboratorsData?.summary.withCommitteeAssessment || 0;
  const totalCount = collaboratorsData?.summary.totalCollaborators || 0;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Processar dados de métricas
  const daysRemaining = metricsData?.deadlines.daysRemaining || null;
  const assessmentCompletion = metricsData?.metrics.selfAssessmentCompletion || 0;

  // Mapear colaboradores para exibição na tabela (primeiros 5)
  const displayCollaborators = collaborators.slice(0, 5).map(collaborator => {
    const summary = collaboratorSummaries[collaborator.id];
    const evaluationScores = summary?.evaluationScores;
    
    return {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.jobTitle,
      avatar: collaborator.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      status: collaborator.hasCommitteeAssessment ? 'Finalizado' : 'Pendente',
      statusColor: collaborator.hasCommitteeAssessment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
      finalScore: collaborator.committeeAssessment?.finalScore || null,
      selfAssessment: evaluationScores?.selfAssessment || null,
      assessment360: evaluationScores?.assessment360 || null,
      managerAssessment: evaluationScores?.managerAssessment || null,
    };
  });

  // Componente inline para detalhes do colaborador
  const CollaboratorDetails: FC<{collaboratorId: string, collaboratorName: string, summary: any}> = ({ 
    collaboratorId, 
    collaboratorName, 
    summary 
  }) => {
    const handleCopyData = async () => {
      if (!summary) return;

      const textData = `
RELATÓRIO DE AVALIAÇÃO - ${summary.collaborator.name}
Ciclo: ${summary.cycle}
Cargo: ${summary.collaborator.jobTitle}
Senioridade: ${summary.collaborator.seniority}

NOTAS CONSOLIDADAS:
• Autoavaliação: ${summary.evaluationScores.selfAssessment || 'N/A'}
• Avaliação 360: ${summary.evaluationScores.assessment360 || 'N/A'}
• Avaliação Gestor: ${summary.evaluationScores.managerAssessment || 'N/A'}
• Mentoring: ${summary.evaluationScores.mentoring || 'N/A'}

RESUMO: ${summary.customSummary}

TOTAL DE AVALIAÇÕES: ${summary.summary.totalAssessmentsReceived}
STATUS COMITÊ: ${summary.summary.hasCommitteeAssessment ? 'Finalizado' : 'Pendente'}
      `.trim();

      try {
        await navigator.clipboard.writeText(textData);
        toast.success('Dados Copiados!', 'Os dados foram copiados para a área de transferência com sucesso.');
      } catch (error) {
        console.error('Erro ao copiar:', error);
        toast.error('Erro ao Copiar', 'Não foi possível copiar os dados. Tente novamente.');
      }
    };

    const renderScoreBar = (score: number | null, label: string) => {
      const percentage = score ? (score / 5) * 100 : 0;
      return (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-bold text-[#085F60]">{score || 'N/A'}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full">
            <div 
              className="h-3 bg-[#085F60] rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      );
    };

    if (!summary) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#085F60] rounded-full flex items-center justify-center text-white font-bold">
              {collaboratorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{collaboratorName}</h3>
              <p className="text-sm text-gray-600">Detalhes da Avaliação</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copiar dados"
            >
              <Copy className="w-5 h-5" />
            </button>
            <ExportButton
              collaboratorId={collaboratorId}
              collaboratorName={collaboratorName}
              hasCommitteeAssessment={summary.summary.hasCommitteeAssessment}
              variant="icon"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Colaborador */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Informações do Colaborador</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{summary.collaborator.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Cargo:</span>
                <p className="font-medium">{summary.collaborator.jobTitle}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Senioridade:</span>
                <p className="font-medium">{summary.collaborator.seniority}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ciclo:</span>
                <p className="font-medium">{summary.cycle}</p>
              </div>
            </div>
          </div>

          {/* Status da Avaliação */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Status da Avaliação</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#085F60]">{summary.summary.totalAssessmentsReceived}</div>
                <div className="text-xs text-gray-600">Total de Avaliações</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${summary.summary.hasCommitteeAssessment ? 'text-green-600' : 'text-yellow-600'}`}>
                  {summary.summary.hasCommitteeAssessment ? 'Sim' : 'Não'}
                </div>
                <div className="text-xs text-gray-600">Avaliação de Comitê</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notas Consolidadas */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Notas Consolidadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreBar(summary.evaluationScores.selfAssessment, 'Autoavaliação')}
            {renderScoreBar(summary.evaluationScores.assessment360, 'Avaliação 360')}
            {renderScoreBar(summary.evaluationScores.managerAssessment, 'Avaliação Gestor')}
            {renderScoreBar(summary.evaluationScores.mentoring, 'Mentoring')}
          </div>
        </div>

        {/* Resumo Personalizado */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
          <h4 className="text-md font-semibold text-blue-900 mb-2">Resumo Consolidado</h4>
          <p className="text-sm text-blue-800">{summary.customSummary}</p>
        </div>

        {/* Avaliação de Comitê se existir */}
        {summary.committeeAssessment && (
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
            <h4 className="text-md font-semibold text-green-900 mb-3">Avaliação de Comitê</h4>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{summary.committeeAssessment.author.name}</p>
                <p className="text-sm text-gray-600">Membro do Comitê</p>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-lg font-bold">
                {summary.committeeAssessment.finalScore}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>Justificativa:</strong></p>
              <p className="mt-1">{summary.committeeAssessment.justification}</p>
              {summary.committeeAssessment.observations && (
                <>
                  <p className="mt-2"><strong>Observações:</strong></p>
                  <p className="mt-1">{summary.committeeAssessment.observations}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (collaboratorsLoading || metricsLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (collaboratorsError || metricsError) {
    const errorMessage = collaboratorsError || metricsError;
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, <span className="text-[#085F60]">Comitê</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#085F60] rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Prazo */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Prazo para Equalização</h3>
              <p className="text-xs text-gray-500">
                {daysRemaining !== null 
                  ? `Faltam ${daysRemaining} dias para o fechamento das equalizações` 
                  : 'Prazo não definido'
                }
              </p>
              <div className="text-2xl font-bold text-[#085F60] mt-2">
                {daysRemaining !== null ? daysRemaining : '--'} 
                <span className="text-sm text-gray-500"> dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Preenchimento */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Progresso de Avaliações</h3>
              <p className="text-xs text-gray-500">{assessmentCompletion}% das autoavaliações foram concluídas</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-2xl font-bold text-[#085F60]">{assessmentCompletion}%</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#085F60] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assessmentCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Equalizações Pendentes */}
        <div 
          className="bg-[#085F60] rounded-lg shadow-sm p-6 text-white cursor-pointer hover:bg-[#064b4c] transition-colors"
          onClick={() => navigate('/committee/equalizacoes')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/90">Equalizações pendentes</h3>
              <p className="text-xs text-white/80">Confira suas revisões de nota</p>
              <div className="text-2xl font-bold text-white mt-2">{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Colaboradores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Resumo de equalizações</h2>
            <button 
              onClick={() => navigate('/committee/equalizacoes')}
              className="text-sm text-[#085F60] hover:text-[#064b4c] font-medium"
            >
              Ver mais
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autoavaliação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliação 360
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota gestor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota final
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayCollaborators.map((collaborator) => (
                <>
                  <tr 
                    key={collaborator.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      expandedCollaborators.includes(collaborator.id) 
                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-[#085F60]' 
                        : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    onClick={() => toggleCollaboratorExpansion(collaborator.id)}
                    title={expandedCollaborators.includes(collaborator.id) ? "Clique para recolher detalhes" : "Clique para ver detalhes"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                          {collaborator.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                          <div className="text-sm text-gray-500">{collaborator.role}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${collaborator.statusColor}`}>
                          {collaborator.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{collaborator.selfAssessment || '--'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{collaborator.assessment360 || '--'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{collaborator.managerAssessment || '--'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {collaborator.finalScore ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#085F60] text-white">
                          {collaborator.finalScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        {expandedCollaborators.includes(collaborator.id) ? (
                          <ChevronUp className="w-5 h-5 text-[#085F60] transform transition-transform" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 transform transition-transform hover:text-[#085F60]" />
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Linha expandida com detalhes */}
                  {expandedCollaborators.includes(collaborator.id) && (
                    <tr key={`${collaborator.id}-details`}>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <CollaboratorDetails 
                          collaboratorId={collaborator.id}
                          collaboratorName={collaborator.name}
                          summary={collaboratorSummaries[collaborator.id]}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommitteePage; 