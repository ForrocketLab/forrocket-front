import React, { useEffect } from 'react';
import { type SelfAssessmentResponse } from '../../../services/EvaluationService';
import SelfEvaluationCard from './SelfEvaluationCard';
import { useEvaluation } from '../../../contexts/EvaluationProvider';

interface CriteriaCardProps {
  title: string;
  filledCount: number;
  totalCount: number;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  children: React.ReactNode;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({
  title,
  filledCount,
  totalCount,
  isMinimized,
  onToggleMinimize,
  children
}) => {
  const progressText = 'preenchidos';
  
  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer"
        onClick={onToggleMinimize}
      >
        <h3 className="m-0 text-lg font-semibold text-[#08605F]">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium rounded-[5px] px-3 py-1 ${
            filledCount === 0
              ? 'bg-[#F33E3E40] text-[#F33E3E]'
              : 'bg-[#24A19F40] text-[#24A19F]'
          }`}>
            {filledCount}/{totalCount} {progressText}
          </span>
          <div className={`text-gray-400 transition-transform duration-200 ${
            isMinimized ? 'rotate-0' : 'rotate-180'
          }`}>
            ▼
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

interface SelfEvaluationProps {
  initialSelfAssessmentData: SelfAssessmentResponse | null;
  cycleId: string;
  onSubmissionSuccess?: () => void; 
}

const SelfEvaluation: React.FC<SelfEvaluationProps> = ({
  initialSelfAssessmentData,
}) => {
  const {
    selfEvaluationData,
    updateSelfEvaluationCriterion,
    toggleSelfEvaluationCard,
    toggleSelfEvaluationItem,
  } = useEvaluation();

  const { postureCriteria, executionCriteria, peopleAndManagementCriteria, cardStates, expandedItems } = selfEvaluationData;

  useEffect(() => {
    if (initialSelfAssessmentData) {
      console.log('📥 Carregando dados da autoavaliação salva no servidor (modo silencioso):', initialSelfAssessmentData);
      
      // Usar uma flag temporária para indicar que estamos carregando dados iniciais
      (window as any).isLoadingInitialData = true;
      
      // Carregar critérios de postura
      console.log('🔄 Atualizando critérios de postura...');
      Object.entries(initialSelfAssessmentData.postureCriteria).forEach(([key, value]) => {
        console.log(`  - ${key}:`, value);
        updateSelfEvaluationCriterion('posture', key, 'score', value.score);
        updateSelfEvaluationCriterion('posture', key, 'justification', value.justification);
      });
      
      // Carregar critérios de execução
      console.log('🔄 Atualizando critérios de execução...');
      Object.entries(initialSelfAssessmentData.executionCriteria).forEach(([key, value]) => {
        console.log(`  - ${key}:`, value);
        updateSelfEvaluationCriterion('execution', key, 'score', value.score);
        updateSelfEvaluationCriterion('execution', key, 'justification', value.justification);
      });
      
      // Carregar critérios de gestão e liderança
      if (initialSelfAssessmentData.peopleAndManagementCriteria) {
        console.log('🔄 Atualizando critérios de gestão e liderança...');
        Object.entries(initialSelfAssessmentData.peopleAndManagementCriteria).forEach(([key, value]) => {
          console.log(`  - ${key}:`, value);
          updateSelfEvaluationCriterion('peopleAndManagement', key, 'score', value.score);
          updateSelfEvaluationCriterion('peopleAndManagement', key, 'justification', value.justification);
        });
      }
      
      // Limpar a flag após o carregamento
      setTimeout(() => {
        (window as any).isLoadingInitialData = false;
        console.log('✅ Dados da autoavaliação carregados com sucesso! Auto-save reativado.');
      }, 500);
    } else {
      console.log('📋 Nenhuma autoavaliação encontrada no servidor, usando dados em branco');
    }
  }, [initialSelfAssessmentData, updateSelfEvaluationCriterion]);

  const countFilledCriteria = (criteriaGroup: typeof postureCriteria | typeof executionCriteria | typeof peopleAndManagementCriteria) => {
    return Object.values(criteriaGroup).filter(
      criterion => criterion.score !== null && criterion.justification.trim() !== ''
    ).length;
  };

  const criteriaLabels = {
    sentimentoDeDono: 'Sentimento de Dono',
    resilienciaNasAdversidades: 'Resiliência nas adversidades',
    organizacaoNoTrabalho: 'Organização no trabalho',
    capacidadeDeAprender: 'Capacidade de aprender',
    serTeamPlayer: 'Ser "team player"',
    entregarComQualidade: 'Entregar com qualidade',
    atenderAosPrazos: 'Atender aos prazos',
    fazerMaisComMenos: 'Fazer mais com menos',
    pensarForaDaCaixa: 'Pensar fora da caixa',
    gente: 'Gente',
    resultados: 'Resultados',
    evolucaoDaRocketCorp: 'Evolução da Rocket Corp'
  };

  const totalPostureCriteria = Object.keys(postureCriteria).length;
  const filledPostureCriteria = countFilledCriteria(postureCriteria);

  const totalExecutionCriteria = Object.keys(executionCriteria).length;
  const filledExecutionCriteria = countFilledCriteria(executionCriteria);

  const totalPeopleAndManagementCriteria = Object.keys(peopleAndManagementCriteria).length;
  const filledPeopleAndManagementCriteria = countFilledCriteria(peopleAndManagementCriteria);

  return (
    <div className="p-0 min-h-screen">
      {/* Card de Critérios de Postura */}
      <CriteriaCard
        title="Critérios de Postura"
        filledCount={filledPostureCriteria}
        totalCount={totalPostureCriteria}
        isMinimized={cardStates.posture}
        onToggleMinimize={() => toggleSelfEvaluationCard('posture')}
      >
        {Object.entries(postureCriteria).map(([key, value], index) => (
          <SelfEvaluationCard
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateSelfEvaluationCriterion('posture', key, 'score', s)}
            onJustificationChange={(j) => updateSelfEvaluationCriterion('posture', key, 'justification', j)}
            isExpanded={expandedItems[`posture-${key}`] || false}
            onToggleExpand={() => toggleSelfEvaluationItem(`posture-${key}`)}
            isFilled={value.score !== null && value.justification.trim() !== ''}
          />
        ))}
      </CriteriaCard>

      {/* Card de Critérios de Execução */}
      <CriteriaCard
        title="Critérios de Execução"
        filledCount={filledExecutionCriteria}
        totalCount={totalExecutionCriteria}
        isMinimized={cardStates.execution}
        onToggleMinimize={() => toggleSelfEvaluationCard('execution')}
      >
        {Object.entries(executionCriteria).map(([key, value], index) => (
          <SelfEvaluationCard
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateSelfEvaluationCriterion('execution', key, 'score', s)}
            onJustificationChange={(j) => updateSelfEvaluationCriterion('execution', key, 'justification', j)}
            isExpanded={expandedItems[`execution-${key}`] || false}
            onToggleExpand={() => toggleSelfEvaluationItem(`execution-${key}`)}
            isFilled={value.score !== null && value.justification.trim() !== ''}
          />
        ))}
      </CriteriaCard>

      {/* Card de Critérios de Gente e Gestão */}
      <CriteriaCard
        title="Critérios de Gente e Gestão"
        filledCount={filledPeopleAndManagementCriteria}
        totalCount={totalPeopleAndManagementCriteria}
        isMinimized={cardStates.peopleAndManagement}
        onToggleMinimize={() => toggleSelfEvaluationCard('peopleAndManagement')}
      >
        {Object.entries(peopleAndManagementCriteria).map(([key, value], index) => (
          <SelfEvaluationCard
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateSelfEvaluationCriterion('peopleAndManagement', key, 'score', s)}
            onJustificationChange={(j) => updateSelfEvaluationCriterion('peopleAndManagement', key, 'justification', j)}
            isExpanded={expandedItems[`peopleAndManagement-${key}`] || false}
            onToggleExpand={() => toggleSelfEvaluationItem(`peopleAndManagement-${key}`)}
            isFilled={value.score !== null && value.justification.trim() !== ''}
          />
        ))}
      </CriteriaCard>
    </div>
  );
};

export default SelfEvaluation;