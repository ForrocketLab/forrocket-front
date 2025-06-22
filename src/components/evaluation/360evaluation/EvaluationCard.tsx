import React, { useState, useMemo } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import type { EvaluableUser } from '../../../types/evaluations';

interface EvaluationCardProps {
  collaborator: EvaluableUser;
  onRemove: () => void;
  onSubmitted: () => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ collaborator, onRemove, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  // flag to verify if it's all done
  const isComplete = useMemo(() => {
    return rating > 0 && strengths.trim() !== '' && improvements.trim() !== '';
  }, [rating, strengths, improvements]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={`bg-white rounded-xl p-6 mb-6 shadow-sm flex flex-col gap-4 cursor-pointer border-2 ${
        isComplete ? 'border-green-200' : 'border-gray-200'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-lg text-gray-500">{collaborator.name.charAt(0)}</div>
          <div>
            <div className="font-bold text-base">{collaborator.name}</div>
            <div className="text-sm text-gray-500">{collaborator.jobTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`rounded-md w-8 h-8 text-lg flex items-center justify-center font-medium ${
            isComplete 
              ? 'bg-green-100 text-green-700' 
              : rating > 0 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-gray-100 text-gray-700'
          }`}>
            {rating || '-'}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }} 
            className="bg-none border-none text-red-500 text-2xl cursor-pointer flex items-center justify-center"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="mt-2 text-sm text-gray-500">Dê uma avaliação de 1 a 5 ao colaborador</div>
          <div className="flex gap-8">
            {[1, 2, 3, 4, 5].map((star) => {
              const StarIcon = star <= rating ? FaStar : FaRegStar;
              return (
                <StarIcon
                  key={star}
                  size={28}
                  className="cursor-pointer"
                  color="#08605F"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRating(star);
                  }}
                />
              );
            })}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Pontos fortes</div>
              <textarea
                placeholder="Justifique sua nota"
                className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Pontos de melhoria</div>
              <textarea
                placeholder="Justifique sua nota"
                className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationCard; 