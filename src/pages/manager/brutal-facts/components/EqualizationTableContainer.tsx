import { type FC, useMemo, useState, useEffect, useRef } from 'react';
import { LuSearch, LuFilter } from 'react-icons/lu';
import EqualizatedCollaboratorRow from './EqualizatedCollaboratorRow';

interface CollaboratorData {
  id: string;
  initials: string;
  name: string;
  jobTitle: string;
  selfAssessmentScore: number | null;
  evaluation360Score: number | null;
  managerScore: number | null;
  finalScore: number | null;
  finalScoreColor: 'green' | 'teal' | 'yellow';
  status: string;
}

interface EqualizationTableContainerProps {
  collaboratorsData: CollaboratorData[];
}

const EqualizationTableContainer: FC<EqualizationTableContainerProps> = ({ collaboratorsData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Fechar popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setShowFilterPopover(false);
      }
    };

    if (showFilterPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPopover]);

  // Filtrar e ordenar colaboradores baseado na busca, filtros e ordenação
  const filteredCollaborators = useMemo(() => {
    const filtered = collaboratorsData.filter(collaborator => {
      const matchesSearch =
        collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || collaborator.status === filterStatus;

      const matchesPerformance =
        filterPerformance === 'all' ||
        (filterPerformance === 'high' && collaborator.finalScore && collaborator.finalScore >= 4.0) ||
        (filterPerformance === 'medium' &&
          collaborator.finalScore &&
          collaborator.finalScore >= 3.5 &&
          collaborator.finalScore < 4.0) ||
        (filterPerformance === 'low' && collaborator.finalScore && collaborator.finalScore < 3.5);

      return matchesSearch && matchesStatus && matchesPerformance;
    });

    // Aplicar ordenação
    switch (sortOrder) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'highest_score':
        filtered.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        break;
      case 'lowest_score':
        filtered.sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, filterStatus, filterPerformance, sortOrder, collaboratorsData]);

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h2 className='text-xl font-semibold text-gray-800'>Resumo de Equalizações</h2>

        {/* Barra de pesquisa e botão de filtros */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto'>
          {/* Barra de pesquisa */}
          <div className='relative'>
            <LuSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={16} />
            <input
              type='text'
              placeholder='Pesquisar colaborador...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 w-full sm:w-64'
            />
          </div>

          {/* Botão de filtros com popover */}
          <div className='relative' ref={filterPopoverRef}>
            <button
              onClick={() => setShowFilterPopover(!showFilterPopover)}
              className='flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium hover:cursor-pointer'
              style={{ backgroundColor: '#08605F' }}
            >
              <LuFilter className='text-white' size={16} />
              Filtros
            </button>

            {/* Popover de filtros */}
            {showFilterPopover && (
              <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 z-10'>
                <div className='space-y-4'>
                  {/* Ordenação */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Ordenar por:</label>
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2'
                    >
                      <option value='alphabetical'>Ordem alfabética</option>
                      <option value='highest_score'>Nota mais alta</option>
                      <option value='lowest_score'>Nota mais baixa</option>
                    </select>
                  </div>

                  {/* Filtro por Performance */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Nível de Performance:</label>
                    <select
                      value={filterPerformance}
                      onChange={e => setFilterPerformance(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2'
                    >
                      <option value='all'>Todos os níveis</option>
                      <option value='high'>Alto desempenho (≥4.0)</option>
                      <option value='medium'>Médio desempenho (3.5-3.9)</option>
                      <option value='low'>Baixo desempenho (&lt;3.5)</option>
                    </select>
                  </div>

                  {/* Filtro por Status */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Status:</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2'
                    >
                      <option value='all'>Todos os status</option>
                      <option value='high'>Performance alta</option>
                      <option value='medium'>Performance média</option>
                      <option value='low'>Performance baixa</option>
                    </select>
                  </div>

                  {/* Botões de ação */}
                  <div className='flex gap-2 pt-2 border-t border-gray-200'>
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterPerformance('all');
                        setSortOrder('alphabetical');
                      }}
                      className='flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors hover:cursor-pointer'
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setShowFilterPopover(false)}
                      className='flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors hover:cursor-pointer'
                      style={{ backgroundColor: '#08605F' }}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de colaboradores com scroll */}
      <div className='max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
        <div className='space-y-2 pr-2'>
          {filteredCollaborators.length > 0 ? (
            filteredCollaborators.map(collaborator => (
              <EqualizatedCollaboratorRow
                key={collaborator.id}
                id={collaborator.id}
                initials={collaborator.initials}
                name={collaborator.name}
                jobTitle={collaborator.jobTitle}
                selfAssessmentScore={collaborator.selfAssessmentScore}
                evaluation360Score={collaborator.evaluation360Score}
                managerScore={collaborator.managerScore}
                finalScore={collaborator.finalScore}
                finalScoreColor={collaborator.finalScoreColor}
              />
            ))
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <p>Nenhum colaborador encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EqualizationTableContainer;
