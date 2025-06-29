import { HiDownload } from 'react-icons/hi';

interface BrutalFactsHeaderProps {
  onToggleDownload: () => void;
}

const BrutalFactsHeader = ({ onToggleDownload }: BrutalFactsHeaderProps) => {
  return (
    <div className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
      <div className='flex justify-between items-center'>
        {/* Título à esquerda */}
        <div className='bg-white rounded-lg px-4 py-2'>
          <h1 className='text-xl font-semibold text-gray-800'>Brutal Facts</h1>
        </div>

        {/* Botão de download à direita */}
        <button
          onClick={onToggleDownload}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium'
        >
          <HiDownload className='text-lg' />
          Download
        </button>
      </div>
    </div>
  );
};

export default BrutalFactsHeader;
