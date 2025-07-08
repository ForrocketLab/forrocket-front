import React, { useRef, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { IoCheckmarkCircle } from 'react-icons/io5';

interface SelfEvaluationCardProps {
  number: number;
  title: string;
  score: number | null;
  justification: string;
  onScoreChange: (score: number) => void;
  onJustificationChange: (justification: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFilled: boolean;
}

const SelfEvaluationCard: React.FC<SelfEvaluationCardProps> = ({
  number,
  title,
  score,
  justification,
  onScoreChange,
  onJustificationChange,
  isExpanded,
  onToggleExpand,
  isFilled
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastValueRef = useRef(justification);

  useEffect(() => {
    if (textareaRef.current && justification !== lastValueRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Atualizar o valor
      textarea.value = justification;
      lastValueRef.current = justification;
      
      // Restaurar a posição do cursor
      textarea.setSelectionRange(start, end);
    }
  }, [justification]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    onToggleExpand();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const newValue = e.target.value;
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      console.log(`📝 Text changed for ${title}:`, newValue);
      onJustificationChange(newValue);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl p-6 mb-6 shadow-sm flex flex-col gap-4 cursor-pointer border-2 ${
        isFilled ? 'border-green-200' : 'border-gray-200'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-0.5">
          <div className="w-10 h-10 flex items-center justify-center">
            {isFilled ? (
              <IoCheckmarkCircle className="text-[#419958] w-6 h-6" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#1D1D1DBF] text-[#1D1D1DBF]">
                {number}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-sm">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md w-8 h-8 text-lg flex items-center justify-center font-bold bg-gray-200 text-[#08605F]">
            {score || '-'}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="mt-2 text-sm text-gray-500">
            Dê uma avaliação de 1 a 5 com base no critério
            <span className="ml-2 text-xs text-green-600">• Salvamento automático ativo</span>
          </div>
          <div className="flex gap-8">
            {[1, 2, 3, 4, 5].map((star) => {
              const StarIcon = star <= (score || 0) ? FaStar : FaRegStar;
              return (
                <StarIcon
                  key={star}
                  className="cursor-pointer w-7 h-7 text-[#08605F]"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`⭐ Star clicked: ${star} for ${title}`);
                    onScoreChange(star);
                  }}
                />
              );
            })}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Justifique sua nota</div>
              <textarea
                ref={textareaRef}
                placeholder="Justifique sua nota"
                className="w-full min-h-[60px] border border-[#CBD5E1] rounded-md p-2 text-sm resize-vertical"
                defaultValue={justification}
                onChange={handleTextChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SelfEvaluationCard; 