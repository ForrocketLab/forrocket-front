import { type FC, useState } from 'react';
import { Download } from 'lucide-react';
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
  const toast = useGlobalToast();

  const handleExport = async () => {
    if (!hasCommitteeAssessment) {
      toast.warning('Exportação Indisponível', 'Exportação disponível apenas após finalização da equalização (avaliação de comitê).');
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.get(`/evaluations/committee/export/${collaboratorId}`);
      const exportData = response.data;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avaliacao_estruturada_${collaboratorName.replace(/\s+/g, '_')}_${exportData.cycle}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Exportação Concluída!', `Arquivo de ${collaboratorName} foi baixado com sucesso.`);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro na Exportação', 'Não foi possível exportar os dados. Verifique se a equalização foi finalizada.');
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleExport}
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
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
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
  );
};

export default ExportButton; 