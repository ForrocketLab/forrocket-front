import React, { useState, useEffect } from 'react';
import EvaluationService, { type CreateSelfAssessmentDto, type SelfAssessmentResponse } from '../../services/EvaluationService';

interface CriterionItemProps {
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

const CriterionItem: React.FC<CriterionItemProps> = ({
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
  return (
    <div style={{ 
      marginBottom: '12px', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <div 
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none'
        }}
        onClick={onToggleExpand}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isFilled ? '#28a745' : '#6c757d',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            marginRight: '12px'
          }}>
            {isFilled ? '✓' : number}
          </div>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#333'
          }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isFilled && (
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginRight: '12px',
              color: '#28a745'
            }}>
              {score}
            </span>
          )}
          <span style={{ 
            fontSize: '18px', 
            color: '#6c757d',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ padding: '20px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            Dê uma avaliação de 1 a 5 com base no critério
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                style={{
                  cursor: 'pointer',
                  fontSize: '28px',
                  color: s <= (score || 0) ? '#ffc107' : '#e0e0e0',
                  marginRight: '8px',
                  transition: 'color 0.2s ease-in-out',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onScoreChange(s);
                }}
              >
                ★
              </span>
            ))}
          </div>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Justifique sua nota
          </p>
          <textarea
            value={justification}
            onChange={(e) => {
              e.stopPropagation();
              onJustificationChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Justifique sua nota..."
            rows={4}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '6px', 
              resize: 'vertical',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      )}
    </div>
  );
};

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
  const progressColor = filledCount === totalCount ? '#28a745' : '#dc3545';
  const progressText = filledCount === totalCount ? 'preenchidos' : 'preenchidos';
  
  return (
    <div style={{ 
      marginBottom: '24px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    }}>
      <div 
        style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isMinimized ? 'none' : '1px solid #e0e0e0'
        }}
        onClick={onToggleMinimize}
      >
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#2c5aa0'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '14px', 
            color: progressColor,
            marginRight: '16px',
            fontWeight: '500'
          }}>
            {filledCount}/{totalCount} {progressText}
          </span>
          <span style={{ 
            fontSize: '16px', 
            color: '#6c757d',
            transform: isMinimized ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {!isMinimized && (
        <div style={{ padding: '16px 24px 24px' }}>
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
  cycleId,
  onSubmissionSuccess,
}) => {
  const [postureCriteria, setPostureCriteria] = useState({
    sentimentoDeDono: { score: null as number | null, justification: '' },
    resilienciaNasAdversidades: { score: null as number | null, justification: '' },
    organizacaoNoTrabalho: { score: null as number | null, justification: '' },
    capacidadeDeAprender: { score: null as number | null, justification: '' },
    serTeamPlayer: { score: null as number | null, justification: '' },
  });

  const [executionCriteria, setExecutionCriteria] = useState({
    entregarComQualidade: { score: null as number | null, justification: '' },
    atenderAosPrazos: { score: null as number | null, justification: '' },
    fazerMaisComMenos: { score: null as number | null, justification: '' },
    pensarForaDaCaixa: { score: null as number | null, justification: '' },
  });

  const [peopleAndManagementCriteria, setPeopleAndManagementCriteria] = useState({
    gente: { score: null as number | null, justification: '' },
    resultados: { score: null as number | null, justification: '' },
    evolucaoDaRocketCorp: { score: null as number | null, justification: '' },
  });

  // Estados para controlar expansão dos cards e itens
  const [cardStates, setCardStates] = useState({
    posture: false,
    execution: false,
    peopleAndManagement: false
  });

  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (initialSelfAssessmentData) {
      setPostureCriteria(initialSelfAssessmentData.postureCriteria);
      setExecutionCriteria(initialSelfAssessmentData.executionCriteria);
      if (initialSelfAssessmentData.peopleAndManagementCriteria) {
        setPeopleAndManagementCriteria(initialSelfAssessmentData.peopleAndManagementCriteria);
      }
    }
  }, [initialSelfAssessmentData]);

  const updateCriterion = (
    group: 'posture' | 'execution' | 'peopleAndManagement',
    criterionName: string,
    field: 'score' | 'justification',
    value: any
  ) => {
    if (group === 'posture') {
      setPostureCriteria(prev => ({
        ...prev,
        [criterionName]: { ...prev[criterionName as keyof typeof prev], [field]: value }
      }));
    } else if (group === 'execution') {
      setExecutionCriteria(prev => ({
        ...prev,
        [criterionName]: { ...prev[criterionName as keyof typeof prev], [field]: value }
      }));
    } else if (group === 'peopleAndManagement') {
      setPeopleAndManagementCriteria(prev => ({
        ...prev,
        [criterionName]: { ...prev[criterionName as keyof typeof prev], [field]: value }
      }));
    }
  };

  const countFilledCriteria = (criteriaGroup: typeof postureCriteria | typeof executionCriteria | typeof peopleAndManagementCriteria) => {
    return Object.values(criteriaGroup).filter(
      criterion => criterion.score !== null && criterion.justification.trim() !== ''
    ).length;
  };

  const toggleCardState = (card: 'posture' | 'execution' | 'peopleAndManagement') => {
    setCardStates(prev => ({ ...prev, [card]: !prev[card] }));
  };

  const toggleItemExpansion = (itemKey: string) => {
    setExpandedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
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

  const handleSubmit = async () => {
    const evaluationData: CreateSelfAssessmentDto = {
      cycleId: cycleId,
      postureCriteria: postureCriteria,
      executionCriteria: executionCriteria,
      peopleAndManagementCriteria: peopleAndManagementCriteria,
    };

    console.log('Dados a serem enviados:', evaluationData);

    try {
      await EvaluationService.createSelfAssessment(evaluationData); 
      
      alert('Autoavaliação enviada com sucesso!');
      if (onSubmissionSuccess) {
        onSubmissionSuccess(); 
      }
    } catch (error: any) {
      alert(`Erro ao enviar autoavaliação: ${error.message}`);
      console.error('Detalhes do erro:', error);
    }
  };

  return (
    <div style={{ 
      padding: '0', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Card de Critérios de Postura */}
      <CriteriaCard
        title="Critérios de Postura"
        filledCount={filledPostureCriteria}
        totalCount={totalPostureCriteria}
        isMinimized={cardStates.posture}
        onToggleMinimize={() => toggleCardState('posture')}
      >
        {Object.entries(postureCriteria).map(([key, value], index) => (
          <CriterionItem
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateCriterion('posture', key, 'score', s)}
            onJustificationChange={(j) => updateCriterion('posture', key, 'justification', j)}
            isExpanded={expandedItems[`posture-${key}`] || false}
            onToggleExpand={() => toggleItemExpansion(`posture-${key}`)}
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
        onToggleMinimize={() => toggleCardState('execution')}
      >
        {Object.entries(executionCriteria).map(([key, value], index) => (
          <CriterionItem
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateCriterion('execution', key, 'score', s)}
            onJustificationChange={(j) => updateCriterion('execution', key, 'justification', j)}
            isExpanded={expandedItems[`execution-${key}`] || false}
            onToggleExpand={() => toggleItemExpansion(`execution-${key}`)}
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
        onToggleMinimize={() => toggleCardState('peopleAndManagement')}
      >
        {Object.entries(peopleAndManagementCriteria).map(([key, value], index) => (
          <CriterionItem
            key={key}
            number={index + 1}
            title={criteriaLabels[key as keyof typeof criteriaLabels]}
            score={value.score}
            justification={value.justification}
            onScoreChange={(s) => updateCriterion('peopleAndManagement', key, 'score', s)}
            onJustificationChange={(j) => updateCriterion('peopleAndManagement', key, 'justification', j)}
            isExpanded={expandedItems[`peopleAndManagement-${key}`] || false}
            onToggleExpand={() => toggleItemExpansion(`peopleAndManagement-${key}`)}
            isFilled={value.score !== null && value.justification.trim() !== ''}
          />
        ))}
      </CriteriaCard>

      <div style={{ 
        marginTop: '32px', 
        textAlign: 'right',
        padding: '0 24px 24px'
      }}>
        <button
          onClick={handleSubmit}
          style={{ 
            padding: '12px 32px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
          }}
        >
          Salvar Autoavaliação
        </button>
      </div>
    </div>
  );
};

export default SelfEvaluation;