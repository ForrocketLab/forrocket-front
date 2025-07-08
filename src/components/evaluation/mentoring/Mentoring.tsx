import React, { useState, useEffect, useMemo } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useEvaluation } from '../../../contexts/EvaluationProvider';
import EvaluationService from '../../../services/EvaluationService';
import { useAutoSave } from '../../../hooks/useAutoSave';

const Mentoring: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<string>('');

  const {
    mentoringData,
    setMentor,
    updateMentoringData,
    isMentoringComplete,
    toggleMentoringCollapsed,
  } = useEvaluation();

  const { mentor, rating, justification, collapsed } = mentoringData;

  // Buscar ciclo ativo
  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const response = await EvaluationService.getActiveCycle();
        setCurrentCycle(response.name);
      } catch (err) {
        console.error('Erro ao buscar ciclo ativo:', err);
      }
    };
    fetchActiveCycle();
  }, []);

  // Configurar autosave
  const { autoSave } = useAutoSave({
    data: { score: rating, justification },
    saveFn: async (data) => {
      if (mentor && currentCycle) {
        await EvaluationService.updateMentoringAssessment(mentor.id, currentCycle, data);
      }
    },
  });

  // Atualizar quando os dados mudam
  useEffect(() => {
    if (mentor && currentCycle) {
      autoSave({ score: rating, justification });
    }
  }, [rating, justification, mentor, currentCycle, autoSave]);

  // flag to verify if it's all done
  const isComplete = useMemo(() => {
    return isMentoringComplete();
  }, [isMentoringComplete]);

  useEffect(() => {
    const fetchMentorAndAssessment = async () => {
      try {
        const { mentors } = await EvaluationService.getEvaluableUsers();
        
        // Se temos mentores disponíveis
        if (mentors.length > 0) {
          const selectedMentor = mentor || mentors[0];
          
          // Buscar avaliação existente
          try {
            const existingAssessment = await EvaluationService.getMentoringAssessment(selectedMentor.id);
            if (existingAssessment) {
              console.log('📋 Avaliação de mentoring encontrada:', existingAssessment);
              setMentor(selectedMentor);
              updateMentoringData({
                rating: existingAssessment.score || 0,
                justification: existingAssessment.justification || '',
              });
            } else {
              console.log('👥 Definindo mentor inicial para mentoring');
              setMentor(selectedMentor);
            }
          } catch (err) {
            console.error('Erro ao buscar avaliação:', err);
            setMentor(selectedMentor);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        setIsLoading(false);
      }
    };
    
    fetchMentorAndAssessment();
  }, []);

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
      className={`bg-white rounded-xl p-6 mb-6 shadow-sm flex flex-col gap-4 cursor-pointer border-2 ${
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
          <div className="rounded-md w-8 h-8 text-lg flex items-center justify-center font-bold bg-gray-200 text-[#08605F]">
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
