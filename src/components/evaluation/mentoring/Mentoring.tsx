import React, { useState, useEffect, useMemo } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useEvaluation } from '../../../contexts/EvaluationProvider';
import type { EvaluableUser } from '../../../types/evaluations';
import EvaluationService from '../../../services/EvaluationService';

const Mentoring: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    mentoringData,
    setMentor,
    updateMentoringData,
    isMentoringComplete,
    toggleMentoringCollapsed,
  } = useEvaluation();

  const { mentor, rating, justification, collapsed } = mentoringData;

  // flag to verify if it's all done
  const isComplete = useMemo(() => {
    return isMentoringComplete();
  }, [isMentoringComplete]);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const { mentors } = await EvaluationService.getEvaluableUsers();
        if (mentors.length > 0 && !mentor) {
          setMentor(mentors[0]);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        setIsLoading(false);
      }
    };
    fetchMentor();
  }, [mentor, setMentor]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    toggleMentoringCollapsed();
  };

  const handleRatingChange = (newRating: number) => {
    updateMentoringData({ rating: newRating });
  };

  const handleJustificationChange = (newJustification: string) => {
    updateMentoringData({ justification: newJustification });
  };

  if (isLoading) {
    return <p>Carregando informações do mentor...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (!mentor) {
    return <p>Você não tem um mentor designado para avaliar neste ciclo.</p>
  }

  return (
    <div 
      className={`bg-white rounded-xl p-8 mb-6 shadow-sm flex flex-col gap-4 cursor-pointer border-2 ${
        isComplete ? 'border-green-200' : 'border-gray-200'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-lg text-gray-500">{mentor.name.charAt(0)}</div>
          <div>
            <div className="font-bold text-base">{mentor.name}</div>
            <div className="text-sm text-gray-500">{mentor.jobTitle}</div>
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
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="mt-2 text-sm text-gray-500">Dê uma avaliação de 1 à 5 ao seu mentor</div>
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
                    handleRatingChange(star);
                  }}
                />
              );
            })}
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Justifique sua nota</div>
            <textarea 
                placeholder="Justifique sua nota"
                className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical"
                value={justification}
                onChange={(e) => handleJustificationChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Mentoring;
