import { ChevronRight, ChevronDown } from 'lucide-react';
import { LuFilePenLine } from 'react-icons/lu';
import { useState, useEffect, useRef } from 'react';

export interface CycleData {
  name: string;
  status: string;
  daysRemaining?: number;
}

export interface CycleStatusProps {
  currentCycle: CycleData;
  availableCycles: CycleData[];
  onCycleChange: (cycle: CycleData) => void;
  isLoadingCycles?: boolean;
}

const CycleStatus = ({ currentCycle, availableCycles, onCycleChange, isLoadingCycles }: CycleStatusProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = currentCycle.status === 'OPEN';

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCycleSelect = (cycle: CycleData) => {
    onCycleChange(cycle);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getCycleStatusText = () => {
    if (isActive) {
      return `Ciclo ${currentCycle.name} de avaliação está aberto`;
    }
    return `Ciclo de Avaliação ${currentCycle.name} finalizado`;
  };

  const getCycleSubText = () => {
    if (isActive && currentCycle.daysRemaining !== undefined) {
      return <span className='font-bold'>{currentCycle.daysRemaining} dias</span>;
    }
    if (!isActive) {
      return (
        <>
          Resultados disponíveis <span className='font-medium'>em breve</span>
        </>
      );
    }
    return null;
  };

  const containerClasses = isActive
    ? 'flex items-center py-8 px-10 mb-4 rounded-2xl bg-[#085F60] text-[#F8F8F8] shadow'
    : 'flex items-center py-8 px-10 mb-4 rounded-2xl bg-white text-[#565656] shadow';

  const buttonClasses = isActive
    ? 'bg-[#085F60] hover:bg-opacity-80 rounded-full p-2 ml-auto transition-colors hover:cursor-pointer'
    : 'bg-[#555555] hover:bg-opacity-80 rounded-full p-2 ml-auto transition-colors hover:cursor-pointer';

  return (
    <div className='relative' ref={dropdownRef}>
      <div className={containerClasses}>
        <LuFilePenLine size={48} className='mr-4' />
        <div className='flex-1'>
          <h2 className='text-xl font-semibold'>{getCycleStatusText()}</h2>
          {getCycleSubText() && (
            <p className='text-sm font-normal'>
              {getCycleSubText()}
              {isActive && currentCycle.daysRemaining !== undefined && ' restantes'}
            </p>
          )}
        </div>
        <button
          onClick={toggleDropdown}
          className={buttonClasses}
          aria-label='Selecionar ciclo'
          disabled={isLoadingCycles}
        >
          {isDropdownOpen ? (
            <ChevronDown size={24} className='text-[#F8F8F8]' />
          ) : (
            <ChevronRight size={24} className='text-[#F8F8F8]' />
          )}
        </button>
      </div>

      {/* Dropdown de ciclos */}
      {isDropdownOpen && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto'>
          {isLoadingCycles ? (
            <div className='px-4 py-3 text-center text-gray-500'>Carregando ciclos...</div>
          ) : availableCycles.length === 0 ? (
            <div className='px-4 py-3 text-center text-gray-500'>Nenhum ciclo disponível</div>
          ) : (
            availableCycles.map(cycle => (
              <button
                key={cycle.name}
                onClick={() => handleCycleSelect(cycle)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  cycle.name === currentCycle.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>Ciclo {cycle.name}</div>
                    <div className='text-sm text-gray-500'>{cycle.status === 'OPEN' ? 'Aberto' : 'Finalizado'}</div>
                  </div>
                  {cycle.status === 'OPEN' && cycle.daysRemaining !== undefined && (
                    <div className='text-sm text-gray-500'>{cycle.daysRemaining} dias restantes</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CycleStatus;
