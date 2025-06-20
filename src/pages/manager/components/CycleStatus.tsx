import { ChevronRight } from 'lucide-react';
import { LuFilePenLine } from 'react-icons/lu';

export interface CycleStatusProps {
  isActive: boolean;
  cycleName: string;
  daysRemaining?: number;
}

const CycleStatus = ({ isActive, cycleName, daysRemaining }: CycleStatusProps) => {
  return isActive ? (
    <div className='flex items-center py-8 px-10 mb-4 rounded-2xl bg-[#085F60] text-[#F8F8F8] shadow'>
      <LuFilePenLine size={48} className='mr-4' />
      <div>
        <h2 className='text-xl font-semibold'>Ciclo {cycleName} de avaliação está aberto</h2>
        {daysRemaining !== undefined && (
          <p className='text-sm font-normal'>
            <span className='font-bold'>{daysRemaining} dias</span> restantes
          </p>
        )}
      </div>
      <button className='bg-[#085F60] hover:bg-opacity-80 rounded-full p-2 ml-auto transition-colors hover:cursor-pointer'>
        <ChevronRight size={24} className='text-[#F8F8F8]' />
      </button>
    </div>
  ) : (
    <div className='flex items-center py-8 px-10 mb-4 rounded-2xl bg-white text-[#565656] shadow'>
      <LuFilePenLine size={48} className='mr-4' />
      <div>
        <h2 className='text-xl font-semibold'>Ciclo de Avaliação {cycleName} finalizado</h2>
        <p className='text-sm'>
          Resultados disponíveis <span className='font-medium'>em breve</span>
        </p>
      </div>
      <button className='bg-[#555555] hover:bg-opacity-80 rounded-full p-2 ml-auto transition-colors hover:cursor-pointer'>
        <ChevronRight size={24} className='text-[#F8F8F8]' />
      </button>
    </div>
  );
};

export default CycleStatus;
