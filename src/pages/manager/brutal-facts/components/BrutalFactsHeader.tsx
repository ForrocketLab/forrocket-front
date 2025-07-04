import { HiDownload } from 'react-icons/hi';
import { FaFileCsv, FaFileCode } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import type {
  BrutalFactsMetricsDto,
  TeamAnalysisDto,
  TeamHistoricalPerformanceDto,
} from '../../../../types/brutalFacts';
import {
  exportBrutalFactsToCSV,
  exportBrutalFactsToJSON,
  exportTeamAnalysisToCSV,
  exportTeamAnalysisToJSON,
  exportHistoricalPerformanceToCSV,
  exportHistoricalPerformanceToJSON,
} from '../../../../utils/exportUtils';

interface BrutalFactsHeaderProps {
  brutalFactsData?: BrutalFactsMetricsDto | null;
  teamAnalysisData?: TeamAnalysisDto | null;
  historicalPerformanceData?: TeamHistoricalPerformanceDto | null;
}

const BrutalFactsHeader = ({
  brutalFactsData,
  teamAnalysisData,
  historicalPerformanceData,
}: BrutalFactsHeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown quando clica fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = (type: 'csv' | 'json', dataType: 'brutal-facts' | 'team-analysis' | 'historical') => {
    try {
      switch (dataType) {
        case 'brutal-facts':
          if (!brutalFactsData) {
            alert('Dados do Brutal Facts não disponíveis');
            return;
          }
          if (type === 'csv') {
            exportBrutalFactsToCSV(brutalFactsData);
          } else {
            exportBrutalFactsToJSON(brutalFactsData);
          }
          break;

        case 'team-analysis':
          if (!teamAnalysisData) {
            alert('Dados da análise da equipe não disponíveis');
            return;
          }
          if (type === 'csv') {
            // Passa dados históricos para combinar com team analysis
            exportTeamAnalysisToCSV(teamAnalysisData);
          } else {
            exportTeamAnalysisToJSON(teamAnalysisData);
          }
          break;

        case 'historical':
          if (!historicalPerformanceData) {
            alert('Dados históricos não disponíveis');
            return;
          }
          if (type === 'csv') {
            exportHistoricalPerformanceToCSV(historicalPerformanceData);
          } else {
            exportHistoricalPerformanceToJSON(historicalPerformanceData);
          }
          break;
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar arquivo. Tente novamente.');
    }
  };
  return (
    <div className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
      <div className='flex justify-between items-center'>
        {/* Título à esquerda */}
        <div className='bg-white rounded-lg px-4 py-2'>
          <h1 className='text-xl font-semibold text-gray-800'>Brutal Facts</h1>
        </div>

        {/* Botão de download com dropdown à direita */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className='flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium hover:cursor-pointer'
            style={{ backgroundColor: '#08605F' }}
          >
            <HiDownload className='text-lg' />
            Exportar
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className='absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
              <div className='p-4'>
                <h3 className='text-sm font-semibold text-gray-800 mb-3'>Exportar Dados</h3>

                {/* Brutal Facts */}
                <div className='mb-4'>
                  <h4 className='text-xs font-medium text-gray-600 mb-2'>Brutal Facts</h4>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleExport('csv', 'brutal-facts')}
                      disabled={!brutalFactsData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCsv />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('json', 'brutal-facts')}
                      disabled={!brutalFactsData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCode />
                      JSON
                    </button>
                  </div>
                </div>

                {/* Team Analysis */}
                <div className='mb-4'>
                  <h4 className='text-xs font-medium text-gray-600 mb-2'>Análise da Equipe</h4>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleExport('csv', 'team-analysis')}
                      disabled={!teamAnalysisData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCsv />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('json', 'team-analysis')}
                      disabled={!teamAnalysisData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCode />
                      JSON
                    </button>
                  </div>
                </div>

                {/* Historical Performance */}
                <div>
                  <h4 className='text-xs font-medium text-gray-600 mb-2'>Performance Histórica</h4>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleExport('csv', 'historical')}
                      disabled={!historicalPerformanceData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCsv />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('json', 'historical')}
                      disabled={!historicalPerformanceData}
                      className='flex items-center gap-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FaFileCode />
                      JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrutalFactsHeader;
