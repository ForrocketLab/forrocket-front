// src/pages/manager/components/FilterStatusPopup.tsx
import { type FC } from 'react';

interface FilterStatusPopupProps {
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  // A prop onClose agora será acionada pelo ManagerCollaborators
}

const FilterStatusPopup: FC<FilterStatusPopupProps> = ({ currentStatus, onSelectStatus }) => {
  const statuses = [
    { value: 'ALL', label: 'Todos os Status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'DRAFT', label: 'Em Andamento' },
    { value: 'SUBMITTED', label: 'Finalizado' },
  ];

  return (
    // Este div agora é o próprio dropdown. Ele será posicionado pelo componente pai.
    <div
      className='bg-white rounded-lg shadow-lg p-3 min-w-[180px] border border-gray-200' // Adicionei border
    >
      <h4 className='font-semibold text-gray-800 mb-2 text-sm'>Filtrar por Status</h4>
      <div className='flex flex-col gap-1'>
        {statuses.map(status => (
          <button
            key={status.value}
            onClick={() => onSelectStatus(status.value)} // Remove onClose aqui, o pai lida com isso
            className={`
              px-3 py-1.5 rounded-md text-left text-sm transition-colors w-full
              ${
                currentStatus === status.value
                  ? 'bg-[#085F60] text-white hover:bg-[#064b4c]' // Cor verde ao selecionar
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterStatusPopup;
