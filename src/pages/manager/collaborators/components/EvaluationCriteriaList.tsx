// src/components/EvaluationCriteriaList.tsx
import { Star, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { ManagerCriterionState } from '../CollaboratorEvaluationDetails';
import StarRating from '../../collaboratorEvaluations/components/StarRating';

interface EvaluationCriteriaListProps {
  answers: SelfAssessmentAnswer[];
  managerAssessments: Record<string, ManagerCriterionState>;
  expandedCriterion: Set<string>;
  completion: { completed: number; total: number };
  getCriterionName: (id: string) => string;
  onToggleExpansion: (id: string) => void;
  onRatingChange: (id: string, score: number) => void;
  onJustificationChange: (id: string, justification: string) => void;
}

const EvaluationCriteriaList = ({
  answers,
  managerAssessments,
  expandedCriterion,
  completion,
  getCriterionName,
  onToggleExpansion,
  onRatingChange,
  onJustificationChange,
}: EvaluationCriteriaListProps) => {
  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-900'>Critérios de Postura</h2>
        <div className='flex items-center gap-3'>
          <div className='bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded'>
            {completion.completed}/{completion.total} preenchidos
          </div>
        </div>
      </div>

      <div className='divide-y divide-gray-200'>
        {answers.length > 0 ? (
          answers.map((answer, index) => {
            const isExpanded = expandedCriterion.has(answer.criterionId);
            const managerScore = managerAssessments[answer.criterionId]?.score || 0;
            const hasManagerAssessment =
              managerScore > 0 && managerAssessments[answer.criterionId]?.justification.trim() !== '';

            return (
              <div key={answer.id}>
                <button
                  className='w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
                  onClick={() => onToggleExpansion(answer.criterionId)}
                >
                  <div className='flex items-center gap-3'>
                    {hasManagerAssessment ? (
                      <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                    ) : (
                      <div className='w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-600'>
                        {index + 1}
                      </div>
                    )}
                    <h3 className='font-medium text-gray-900'>{getCriterionName(answer.criterionId)}</h3>
                  </div>

                  <div className='flex items-center gap-4'>
                    <div className='text-sm font-medium text-gray-600'>{answer.score.toFixed(1)}</div>
                    <div className='text-sm font-medium text-gray-900'>
                      {managerScore > 0 ? managerScore.toFixed(1) : '-'}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className='w-5 h-5 text-gray-400' />
                    ) : (
                      <ChevronDown className='w-5 h-5 text-gray-400' />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className='px-6 pb-6 bg-gray-50'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4'>
                      <div className='space-y-3'>
                        <div className='text-sm font-medium text-gray-700'>Autoavaliação</div>
                        <div className='flex items-center gap-1'>
                          <StarRating rating={answer.score} size={24} disabled={true} />
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-700 mb-2'>Justificativa</div>
                          <div className='bg-white p-3 rounded-md border border-gray-200 text-sm text-gray-700'>
                            {answer.justification || 'Nenhuma justificativa fornecida'}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-3'>
                        <div className='text-sm font-medium text-gray-700'>
                          Sua avaliação de 1 a 5 com base no critério
                        </div>
                        <div className='flex items-center gap-1'>
                          {[1, 2, 3, 4, 5].map(starValue => (
                            <button
                              key={starValue}
                              type='button'
                              onClick={() => onRatingChange(answer.criterionId, starValue)}
                              className='transition-colors hover:scale-110'
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  starValue <= managerScore
                                    ? 'text-teal-600 fill-current'
                                    : 'text-gray-300 hover:text-teal-400'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-700 mb-2'>Justifique sua nota</div>
                          <textarea
                            rows={4}
                            placeholder='Justifique sua nota...'
                            value={managerAssessments[answer.criterionId]?.justification || ''}
                            onChange={e => onJustificationChange(answer.criterionId, e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none placeholder-gray-400'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className='text-center p-8'>
            <p className='text-gray-500'>Nenhum critério de autoavaliação encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationCriteriaList;
