import { type FC, useState, useEffect, useRef } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import api from '../api';
import { useGlobalToast } from '../hooks/useGlobalToast';

interface ExportButtonProps {
  collaboratorId: string;
  collaboratorName: string;
  hasCommitteeAssessment: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

const ExportButton: FC<ExportButtonProps> = ({ 
  collaboratorId, 
  collaboratorName, 
  hasCommitteeAssessment,
  variant = 'icon',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useGlobalToast();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[°º]/g, '')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C');
  };

  const convertToCSV = (data: any) => {
    const csvRows = [];
    
    // TABELA 1: INFORMAÇÕES GERAIS
    csvRows.push('RELATORIO DE AVALIACAO ESTRUTURADA');
    csvRows.push('');
    csvRows.push('=== INFORMACOES GERAIS ===');
    csvRows.push('Campo,Valor');
    csvRows.push(`Colaborador,"${removeAccents(data.collaborator?.name || 'N/A')}"`);
    csvRows.push(`Cargo,"${removeAccents(data.collaborator?.jobTitle || 'N/A')}"`);
    csvRows.push(`Ciclo,"${data.cycle || 'N/A'}"`);
    csvRows.push(`Data da Exportacao,"${new Date().toLocaleDateString('pt-BR')}"`);
    csvRows.push('');
    
    // TABELA 2: NOTAS POR TIPO DE AVALIACAO
    csvRows.push('=== NOTAS POR TIPO DE AVALIACAO ===');
    csvRows.push('Tipo de Avaliacao,Nota,Status,Percentual');
    
    const scores = data.consolidatedScores || data.evaluationScores || {};
    
    if (scores.selfAssessment !== null && scores.selfAssessment !== undefined) {
      const percent = ((scores.selfAssessment / 5) * 100).toFixed(1);
      csvRows.push(`Autoavaliacao,${scores.selfAssessment},Concluida,${percent}%`);
    } else {
      csvRows.push(`Autoavaliacao,N/A,Pendente,0%`);
    }
    
    if (scores.assessment360 !== null && scores.assessment360 !== undefined) {
      const percent = ((scores.assessment360 / 5) * 100).toFixed(1);
      csvRows.push(`Avaliacao 360,${scores.assessment360},Concluida,${percent}%`);
    } else {
      csvRows.push(`Avaliacao 360,N/A,Pendente,0%`);
    }
    
    if (scores.managerAssessment !== null && scores.managerAssessment !== undefined) {
      const percent = ((scores.managerAssessment / 5) * 100).toFixed(1);
      csvRows.push(`Avaliacao do Gestor,${scores.managerAssessment},Concluida,${percent}%`);
    } else {
      csvRows.push(`Avaliacao do Gestor,N/A,Pendente,0%`);
    }
    
    if (scores.mentoring !== null && scores.mentoring !== undefined) {
      const percent = ((scores.mentoring / 5) * 100).toFixed(1);
      csvRows.push(`Mentoring,${scores.mentoring},Concluida,${percent}%`);
    } else {
      csvRows.push(`Mentoring,N/A,Pendente,0%`);
    }
    
    csvRows.push('');
    
    // TABELA 3: ANALISE DE DISCREPANCIAS
    csvRows.push('=== ANALISE DE DISCREPANCIAS ===');
    const discrepancyScores = [
      scores.selfAssessment,
      scores.assessment360,
      scores.managerAssessment,
      scores.mentoring
    ].filter(score => score !== null && score !== undefined);
    
    if (discrepancyScores.length >= 2) {
      const maxScore = Math.max(...discrepancyScores);
      const minScore = Math.min(...discrepancyScores);
      const difference = maxScore - minScore;
      const avgScore = discrepancyScores.reduce((sum: number, score: number) => sum + score, 0) / discrepancyScores.length;
      
      let nivel = '';
      let classificacao = '';
      if (difference >= 1.5) {
        nivel = 'Alta';
        classificacao = 'Requer atencao especial';
      } else if (difference >= 1.0) {
        nivel = 'Moderada';
        classificacao = 'Variacao normal';
      } else {
        nivel = 'Baixa';
        classificacao = 'Avaliacoes alinhadas';
      }
      
      csvRows.push('Metrica,Valor,Classificacao');
      csvRows.push(`Nota Maxima,${maxScore},Melhor avaliacao`);
      csvRows.push(`Nota Minima,${minScore},Menor avaliacao`);
      csvRows.push(`Diferenca,${difference.toFixed(1)},Amplitude das notas`);
      csvRows.push(`Media Geral,${avgScore.toFixed(1)},Nota media consolidada`);
      csvRows.push(`Nivel de Discrepancia,${nivel},${classificacao}`);
    } else {
      csvRows.push('Metrica,Valor,Classificacao');
      csvRows.push('Analise de Discrepancia,Indisponivel,Poucas avaliacoes para comparacao');
    }
    
    csvRows.push('');
    
    // TABELA 4: AVALIACAO FINAL DO COMITE
    csvRows.push('=== AVALIACAO FINAL DO COMITE ===');
    csvRows.push('Campo,Valor,Observacoes');
    
    // Tentar diferentes caminhos para os dados do comitê
    const committeeData = data.committeeAssessment || 
                          data.evaluationData?.committeeAssessment ||
                          data.summary?.committeeAssessment ||
                          data.evaluationScores?.committeeAssessment || 
                          {};
    
    const finalScore = committeeData.finalScore || 
                       scores.finalScore || 
                       data.finalScore ||
                       data.evaluationData?.finalScore ||
                       data.summary?.finalScore;
    const finalPercent = finalScore ? ((finalScore / 5) * 100).toFixed(1) + '%' : 'N/A';
    
    // Debug: log para ver a estrutura dos dados
    console.log('Debug - Committee data:', committeeData);
    console.log('Debug - Full data structure:', JSON.stringify(data, null, 2));
    console.log('Debug - evaluationData:', data.evaluationData);
    console.log('Debug - summary:', data.summary);
    
    csvRows.push(`Nota Final,${finalScore || 'N/A'},${finalPercent}`);
    
    // Tentar diferentes caminhos para o nome do avaliador
    const evaluatorName = committeeData.author?.name || 
                          committeeData.evaluator?.name || 
                          data.committeeEvaluator?.name ||
                          data.author?.name ||
                          data.evaluationData?.committeeAssessment?.author?.name ||
                          data.summary?.committeeAssessment?.author?.name ||
                          data.evaluationData?.author?.name ||
                          'N/A';
    
    csvRows.push(`Avaliador,"${removeAccents(evaluatorName)}",Membro do comite`);
    
    // Tentar diferentes caminhos para a justificativa
    const justification = committeeData.justification || 
                          committeeData.comment || 
                          committeeData.feedback ||
                          data.justification ||
                          data.evaluationData?.committeeAssessment?.justification ||
                          data.summary?.committeeAssessment?.justification ||
                          data.evaluationData?.justification ||
                          'N/A';
    
    const cleanJustification = removeAccents(justification.replace(/"/g, '""')); // Escape quotes
    csvRows.push(`Justificativa,"${cleanJustification}",Fundamentacao da nota`);
    
    // Observações opcionais
    const observations = committeeData.observations || 
                        committeeData.notes || 
                        data.observations ||
                        data.evaluationData?.committeeAssessment?.observations ||
                        data.summary?.committeeAssessment?.observations;
    
    if (observations) {
      const cleanObservations = removeAccents(observations.replace(/"/g, '""'));
      csvRows.push(`Observacoes,"${cleanObservations}",Comentarios adicionais`);
    }
    
    csvRows.push('');
    
    // TABELA 5: RESUMO CONSOLIDADO
    csvRows.push('=== RESUMO CONSOLIDADO ===');
    csvRows.push('Tipo,Conteudo');
    const summary = data.summary?.customSummary || data.customSummary || 'Nenhum resumo disponivel';
    const cleanSummary = removeAccents(summary.replace(/"/g, '""'));
    csvRows.push(`Resumo Executivo,"${cleanSummary}"`);
    
    csvRows.push('');
    
    // TABELA 6: ESTATISTICAS RESUMIDAS
    csvRows.push('=== ESTATISTICAS RESUMIDAS ===');
    csvRows.push('Indicador,Valor,Descricao');
    
    if (discrepancyScores.length > 0) {
      const totalAvaliacoes = Object.values(scores).filter(score => score !== null && score !== undefined).length;
      const mediaGeral = discrepancyScores.reduce((sum, score) => sum + score, 0) / discrepancyScores.length;
      
      csvRows.push(`Total de Avaliacoes,${totalAvaliacoes},Numero de avaliacoes concluidas`);
      csvRows.push(`Media Geral,${mediaGeral.toFixed(2)},Media de todas as avaliacoes`);
      csvRows.push(`Nota Final,${finalScore || 'Pendente'},Nota apos equalizacao do comite`);
      
      const status = finalScore ? 'Finalizada' : 'Em andamento';
      csvRows.push(`Status da Equalizacao,${status},Situacao atual do processo`);
    }
    
    return csvRows.join('\n');
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    if (!hasCommitteeAssessment) {
      toast.warning('Exportação Indisponível', 'Exportação disponível apenas após finalização da equalização (avaliação de comitê).');
      return;
    }

    setIsExporting(true);
    try {
      console.log('Iniciando exportação...', { collaboratorId, format });
      const response = await api.get(`/evaluations/committee/export/${collaboratorId}`);
      console.log('Resposta da API:', response.data);
      const exportData = response.data;

      let blob, fileName, mimeType;
      
      if (format === 'csv') {
        console.log('Convertendo para CSV...');
        const csvContent = convertToCSV(exportData);
        console.log('CSV gerado:', csvContent.substring(0, 200) + '...');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        fileName = `avaliacao_estruturada_${collaboratorName.replace(/\s+/g, '_')}_${exportData.cycle || 'sem_ciclo'}.csv`;
        mimeType = 'CSV';
      } else {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        fileName = `avaliacao_estruturada_${collaboratorName.replace(/\s+/g, '_')}_${exportData.cycle || 'sem_ciclo'}.json`;
        mimeType = 'JSON';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Exportação Concluída!', `Arquivo ${mimeType} de ${collaboratorName} foi baixado com sucesso.`);
      setShowDropdown(false);
    } catch (error: any) {
      console.error('Erro detalhado na exportação:', error);
      console.error('Response status:', error?.response?.status);
      console.error('Response data:', error?.response?.data);
      
      let errorMessage = 'Não foi possível exportar os dados.';
      
      if (error?.response?.status === 403) {
        errorMessage = 'Equalização ainda não foi concluída para este colaborador.';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Colaborador não encontrado.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error('Erro na Exportação', errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting || !hasCommitteeAssessment}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasCommitteeAssessment
              ? 'bg-[#085F60] text-white hover:bg-[#064b4c]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          } ${className}`}
          title={hasCommitteeAssessment ? 'Exportar dados estruturados' : 'Disponível após finalização da equalização'}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exportando...' : 'Exportar'}
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && hasCommitteeAssessment && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar como CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar como JSON
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || !hasCommitteeAssessment}
        className={`p-2 rounded-lg transition-colors ${
          hasCommitteeAssessment
            ? 'text-gray-400 hover:text-[#085F60] hover:bg-gray-100'
            : 'text-gray-300 cursor-not-allowed'
        } ${className}`}
        title={hasCommitteeAssessment ? 'Exportar dados estruturados' : 'Disponível após finalização da equalização'}
      >
        <Download className="w-4 h-4" />
      </button>

      {showDropdown && hasCommitteeAssessment && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar como CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar como JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton; 