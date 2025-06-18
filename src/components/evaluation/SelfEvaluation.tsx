import React, { useState, useEffect } from 'react';
import EvaluationService, { type CreateSelfAssessmentDto, type SelfAssessmentResponse } from '../../services/EvaluationService';

interface CriterionProps {
  title: string;
  score: number | null;
  justification: string;
  onScoreChange: (score: number) => void;
  onJustificationChange: (justification: string) => void;
  isFilled?: boolean;
}

const Criterion: React.FC<CriterionProps> = ({
  title,
  score,
  justification,
  onScoreChange,
  onJustificationChange,
  isFilled = false,
}) => {
  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', position: 'relative' }}>
      <h3 style={{ marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '10px' }}>Dê uma avaliação de 1 a 5 com base no critério</p>
      <div style={{ marginBottom: '15px' }}>
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
            onClick={() => onScoreChange(s)}
          >
            ★
          </span>
        ))}
      </div>
      <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '5px' }}>Justifique sua nota</p>
      <textarea
        value={justification}
        onChange={(e) => onJustificationChange(e.target.value)}
        placeholder="Justifique sua nota..."
        rows={4}
        style={{ width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
      />
      {isFilled && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '0.8em',
          fontWeight: 'bold',
        }}>
          Preenchido
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
      const response = await EvaluationService.createSelfAssessment(evaluationData);
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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>Critérios de Postura</h2>
        <span style={{ fontSize: '0.9em', color: filledPostureCriteria === totalPostureCriteria ? '#28a745' : '#dc3545' }}>
          {filledPostureCriteria}/{totalPostureCriteria} preenchidos
        </span>
      </div>
      {Object.entries(postureCriteria).map(([key, value]) => (
        <Criterion
          key={key}
          title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          score={value.score}
          justification={value.justification}
          onScoreChange={(s) => updateCriterion('posture', key, 'score', s)}
          onJustificationChange={(j) => updateCriterion('posture', key, 'justification', j)}
          isFilled={value.score !== null && value.justification.trim() !== ''}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '40px' }}>
        <h2 style={{ color: '#333' }}>Critérios de Execução</h2>
        <span style={{ fontSize: '0.9em', color: filledExecutionCriteria === totalExecutionCriteria ? '#28a745' : '#dc3545' }}>
          {filledExecutionCriteria}/{totalExecutionCriteria} preenchidos
        </span>
      </div>
      {Object.entries(executionCriteria).map(([key, value]) => (
        <Criterion
          key={key}
          title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          score={value.score}
          justification={value.justification}
          onScoreChange={(s) => updateCriterion('execution', key, 'score', s)}
          onJustificationChange={(j) => updateCriterion('execution', key, 'justification', j)}
          isFilled={value.score !== null && value.justification.trim() !== ''}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '40px' }}>
        <h2 style={{ color: '#333' }}>Critérios de Gente e Gestão</h2>
        <span style={{ fontSize: '0.9em', color: filledPeopleAndManagementCriteria === totalPeopleAndManagementCriteria ? '#28a745' : '#dc3545' }}>
          {filledPeopleAndManagementCriteria}/{totalPeopleAndManagementCriteria} preenchidos
        </span>
      </div>
      {Object.entries(peopleAndManagementCriteria).map(([key, value]) => (
        <Criterion
          key={key}
          title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          score={value.score}
          justification={value.justification}
          onScoreChange={(s) => updateCriterion('peopleAndManagement', key, 'score', s)}
          onJustificationChange={(j) => updateCriterion('peopleAndManagement', key, 'justification', j)}
          isFilled={value.score !== null && value.justification.trim() !== ''}
        />
      ))}

      <div style={{ marginTop: '40px', textAlign: 'right' }}>
        <button
          onClick={handleSubmit}
          style={{ padding: '12px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}
        >
          Salvar Autoavaliação
        </button>
      </div>
    </div>
  );
};

export default SelfEvaluation;