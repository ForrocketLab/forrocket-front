import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StarRating from './StarRating';

// Interface para as props de cada card
export interface EvaluationCardProps {
  evaluatorName: string;
  evaluatorJobTitle: string;
  rating: number;
  strengths: string;
  weaknesses: string;
}

const EvaluationCard = ({ evaluatorName, evaluatorJobTitle, rating, strengths, weaknesses }: EvaluationCardProps) => {
  // Estado para controlar se o card está expandido (começa aberto)
  const [isOpen, setIsOpen] = useState(true);

  return (
    // Container do card individual
    <div className='border border-gray-200 rounded-xl bg-white p-4 mb-4'>
      {/* Cabeçalho do Card (clicável para abrir/fechar) */}
      <header className='flex items-center justify-between cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
        <div className='flex items-center gap-4'>
          <span className='bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-gray-700 text-sm uppercase'>
            {evaluatorName
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div>
            <h3 className='font-bold text-gray-800'>{evaluatorName}</h3>
            <p className='text-sm text-gray-500'>{evaluatorJobTitle}</p>
          </div>
        </div>
        <button className='p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer'>
          {isOpen ? <ChevronUp className='text-gray-600' /> : <ChevronDown className='text-gray-600' />}
        </button>
      </header>

      {/* Corpo do Card (renderizado condicionalmente) */}
      {isOpen && (
        <div className='mt-4 pt-4 border-t border-gray-100'>
          <p className='text-gray-500 mb-2 text-xs'>Nota atribuída ao colaborador</p>
          <div className='mb-4'>
            <StarRating rating={rating} disabled />
          </div>

          {/* Grid responsivo para Pontos Fortes e Fracos */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold text-gray-700 mb-2'>Pontos fortes</h4>
              <textarea
                disabled
                value={strengths}
                className='w-full min-h-[120px] p-3 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-sm text-gray-800 resize-none focus:outline-none'
                rows={4}
              />
            </div>
            <div>
              <h4 className='font-semibold text-gray-700 mb-2'>Pontos a desenvolver</h4>
              <textarea
                disabled
                value={weaknesses}
                className='w-full min-h-[120px] p-3 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-sm text-gray-800 resize-none focus:outline-none'
                rows={4}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationCard;
