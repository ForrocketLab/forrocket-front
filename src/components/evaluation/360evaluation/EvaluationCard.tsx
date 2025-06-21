import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';

interface EvaluationCardProps {
  collaborator: {
    id: number;
    name: string;
    role: string;
    initials: string;
  };
  onRemove: () => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ collaborator, onRemove }) => {
  const [rating, setRating] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-lg text-gray-500">{collaborator.initials}</div>
          <div>
            <div className="font-bold text-base">{collaborator.name}</div>
            <div className="text-sm text-gray-500">{collaborator.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCollapsed(!collapsed)} className="bg-gray-100 border-none rounded-md w-8 h-8 text-lg cursor-pointer flex items-center justify-center">-</button>
          <button onClick={onRemove} className="bg-none border-none text-red-500 text-2xl cursor-pointer flex items-center justify-center"><FiTrash2 /></button>
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
                  onClick={() => setRating(star)}
                />
              );
            })}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Pontos fortes</div>
              <textarea placeholder="Justifique sua nota" className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Pontos de melhoria</div>
              <textarea placeholder="Justifique sua nota" className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationCard; 