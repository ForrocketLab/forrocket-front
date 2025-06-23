import { createContext, useState, useContext, useEffect, type FC, type ReactNode } from 'react';
import type { EvaluableUser } from '../types/evaluations';
import { useAuth } from '../hooks/useAuth';

interface Evaluation360Data {
  collaborator: EvaluableUser;
  rating: number;
  strengths: string;
  improvements: string;
  isSubmitted: boolean;
  collapsed: boolean;
}

interface MentoringData {
  mentor: EvaluableUser | null;
  rating: number;
  justification: string;
  isSubmitted: boolean;
  collapsed: boolean;
}

interface SelfEvaluationData {
  postureCriteria: {
    sentimentoDeDono: { score: number | null; justification: string };
    resilienciaNasAdversidades: { score: number | null; justification: string };
    organizacaoNoTrabalho: { score: number | null; justification: string };
    capacidadeDeAprender: { score: number | null; justification: string };
    serTeamPlayer: { score: number | null; justification: string };
  };
  executionCriteria: {
    entregarComQualidade: { score: number | null; justification: string };
    atenderAosPrazos: { score: number | null; justification: string };
    fazerMaisComMenos: { score: number | null; justification: string };
    pensarForaDaCaixa: { score: number | null; justification: string };
  };
  peopleAndManagementCriteria: {
    gente: { score: number | null; justification: string };
    resultados: { score: number | null; justification: string };
    evolucaoDaRocketCorp: { score: number | null; justification: string };
  };
  isSubmitted: boolean;
  cardStates: {
    posture: boolean;
    execution: boolean;
    peopleAndManagement: boolean;
  };
  expandedItems: { [key: string]: boolean };
}

interface EvaluationContextType {
  evaluations360: Evaluation360Data[];
  addEvaluation360: (collaborator: EvaluableUser) => void;
  updateEvaluation360: (collaboratorId: string, data: Partial<Omit<Evaluation360Data, 'collaborator'>>) => void;
  removeEvaluation360: (collaboratorId: string) => void;
  submitEvaluation360: (collaboratorId: string) => void;
  toggleEvaluation360Collapsed: (collaboratorId: string) => void;
  

  mentoringData: MentoringData;
  setMentor: (mentor: EvaluableUser) => void;
  updateMentoringData: (data: Partial<Omit<MentoringData, 'mentor'>>) => void;
  submitMentoring: () => void;
  toggleMentoringCollapsed: () => void;
  

  selfEvaluationData: SelfEvaluationData;
  updateSelfEvaluationCriterion: (
    group: 'posture' | 'execution' | 'peopleAndManagement',
    criterionName: string,
    field: 'score' | 'justification',
    value: any
  ) => void;
  toggleSelfEvaluationCard: (card: 'posture' | 'execution' | 'peopleAndManagement') => void;
  toggleSelfEvaluationItem: (itemKey: string) => void;
  submitSelfEvaluation: () => void;
  isSelfEvaluationComplete: () => boolean;
  

  getEvaluation360ByCollaborator: (collaboratorId: string) => Evaluation360Data | undefined;
  isEvaluation360Complete: (collaboratorId: string) => boolean;
  isMentoringComplete: () => boolean;
  
  clearAllData: () => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation deve ser usado dentro de um EvaluationProvider');
  }
  return context;
};

interface EvaluationProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  EVALUATIONS_360: 'evaluations_360',
  MENTORING_DATA: 'mentoring_data',
  SELF_EVALUATION_DATA: 'self_evaluation_data',
} as const;

export const EvaluationProvider: FC<EvaluationProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Função para carregar dados do localStorage de forma segura
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        console.log(`📂 Carregando ${key} do localStorage:`, stored);
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar ${key} do localStorage:`, error);
    }
    return defaultValue;
  };

  const [evaluations360, setEvaluations360] = useState<Evaluation360Data[]>(() => 
    loadFromStorage(STORAGE_KEYS.EVALUATIONS_360, [])
  );
  
  const [mentoringData, setMentoringData] = useState<MentoringData>(() => 
    loadFromStorage(STORAGE_KEYS.MENTORING_DATA, {
      mentor: null,
      rating: 0,
      justification: '',
      isSubmitted: false,
      collapsed: false,
    })
  );
  
  const [selfEvaluationData, setSelfEvaluationData] = useState<SelfEvaluationData>(() => 
    loadFromStorage(STORAGE_KEYS.SELF_EVALUATION_DATA, {
      postureCriteria: {
        sentimentoDeDono: { score: null, justification: '' },
        resilienciaNasAdversidades: { score: null, justification: '' },
        organizacaoNoTrabalho: { score: null, justification: '' },
        capacidadeDeAprender: { score: null, justification: '' },
        serTeamPlayer: { score: null, justification: '' },
      },
      executionCriteria: {
        entregarComQualidade: { score: null, justification: '' },
        atenderAosPrazos: { score: null, justification: '' },
        fazerMaisComMenos: { score: null, justification: '' },
        pensarForaDaCaixa: { score: null, justification: '' },
      },
      peopleAndManagementCriteria: {
        gente: { score: null, justification: '' },
        resultados: { score: null, justification: '' },
        evolucaoDaRocketCorp: { score: null, justification: '' },
      },
      isSubmitted: false,
      cardStates: {
        posture: false,
        execution: false,
        peopleAndManagement: false,
      },
      expandedItems: {},
    })
  );

  console.log('🚀 EvaluationProvider inicializado com dados:', {
    evaluations360: evaluations360.length,
    mentoringData: mentoringData.rating > 0 ? 'com dados' : 'vazio',
    selfEvaluationData: Object.values(selfEvaluationData.postureCriteria).some(c => c.score !== null) ? 'com dados' : 'vazio'
  });

  useEffect(() => {
    try {
      console.log('💾 Salvando avaliações 360 no localStorage:', evaluations360);
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS_360, JSON.stringify(evaluations360));
    } catch (error) {
      console.error('❌ Erro ao salvar avaliações 360 no localStorage:', error);
    }
  }, [evaluations360]);


  useEffect(() => {
    try {
      console.log('💾 Salvando dados de mentoring no localStorage:', mentoringData);
      localStorage.setItem(STORAGE_KEYS.MENTORING_DATA, JSON.stringify(mentoringData));
    } catch (error) {
      console.error('❌ Erro ao salvar dados de mentoring no localStorage:', error);
    }
  }, [mentoringData]);

  useEffect(() => {
    try {
      console.log('💾 Salvando dados de autoavaliação no localStorage:', selfEvaluationData);
      localStorage.setItem(STORAGE_KEYS.SELF_EVALUATION_DATA, JSON.stringify(selfEvaluationData));
    } catch (error) {
      console.error('❌ Erro ao salvar dados de autoavaliação no localStorage:', error);
    }
  }, [selfEvaluationData]);


  const addEvaluation360 = (collaborator: EvaluableUser) => {
    setEvaluations360(prev => [
      ...prev,
      {
        collaborator,
        rating: 0,
        strengths: '',
        improvements: '',
        isSubmitted: false,
        collapsed: false,
      }
    ]);
  };

  const updateEvaluation360 = (collaboratorId: string, data: Partial<Omit<Evaluation360Data, 'collaborator'>>) => {
    setEvaluations360(prev => 
      prev.map(evaluation => 
        evaluation.collaborator.id === collaboratorId 
          ? { ...evaluation, ...data }
          : evaluation
      )
    );
  };

  const removeEvaluation360 = (collaboratorId: string) => {
    setEvaluations360(prev => prev.filter(evaluation => evaluation.collaborator.id !== collaboratorId));
  };

  const submitEvaluation360 = (collaboratorId: string) => {
    updateEvaluation360(collaboratorId, { isSubmitted: true });
  };

  const toggleEvaluation360Collapsed = (collaboratorId: string) => {
    setEvaluations360(prev => 
      prev.map(evaluation => 
        evaluation.collaborator.id === collaboratorId 
          ? { ...evaluation, collapsed: !evaluation.collapsed }
          : evaluation
      )
    );
  };


  const setMentor = (mentor: EvaluableUser) => {
    setMentoringData(prev => ({ ...prev, mentor }));
  };

  const updateMentoringData = (data: Partial<Omit<MentoringData, 'mentor'>>) => {
    setMentoringData(prev => ({ ...prev, ...data }));
  };

  const submitMentoring = () => {
    setMentoringData(prev => ({ ...prev, isSubmitted: true }));
  };

  const toggleMentoringCollapsed = () => {
    setMentoringData(prev => ({ ...prev, collapsed: !prev.collapsed }));
  };


  const getEvaluation360ByCollaborator = (collaboratorId: string) => {
    return evaluations360.find(evaluation => evaluation.collaborator.id === collaboratorId);
  };

  const isEvaluation360Complete = (collaboratorId: string) => {
    const evaluation = getEvaluation360ByCollaborator(collaboratorId);
    return evaluation ? 
      evaluation.rating > 0 && 
      evaluation.strengths.trim() !== '' && 
      evaluation.improvements.trim() !== '' : false;
  };

  const isMentoringComplete = () => {
    return mentoringData.rating > 0 && mentoringData.justification.trim() !== '';
  };


  const updateSelfEvaluationCriterion = (
    group: 'posture' | 'execution' | 'peopleAndManagement',
    criterionName: string,
    field: 'score' | 'justification',
    value: any
  ) => {
    setSelfEvaluationData(prev => {
      const newData = { ...prev };
      if (group === 'posture') {
        newData.postureCriteria = {
          ...prev.postureCriteria,
          [criterionName]: { ...prev.postureCriteria[criterionName as keyof typeof prev.postureCriteria], [field]: value }
        };
      } else if (group === 'execution') {
        newData.executionCriteria = {
          ...prev.executionCriteria,
          [criterionName]: { ...prev.executionCriteria[criterionName as keyof typeof prev.executionCriteria], [field]: value }
        };
      } else if (group === 'peopleAndManagement') {
        newData.peopleAndManagementCriteria = {
          ...prev.peopleAndManagementCriteria,
          [criterionName]: { ...prev.peopleAndManagementCriteria[criterionName as keyof typeof prev.peopleAndManagementCriteria], [field]: value }
        };
      }
      return newData;
    });
  };

  const toggleSelfEvaluationCard = (card: 'posture' | 'execution' | 'peopleAndManagement') => {
    setSelfEvaluationData(prev => ({
      ...prev,
      cardStates: { ...prev.cardStates, [card]: !prev.cardStates[card] }
    }));
  };

  const toggleSelfEvaluationItem = (itemKey: string) => {
    setSelfEvaluationData(prev => ({
      ...prev,
      expandedItems: { ...prev.expandedItems, [itemKey]: !prev.expandedItems[itemKey] }
    }));
  };

  const submitSelfEvaluation = () => {
    setSelfEvaluationData(prev => ({ ...prev, isSubmitted: true }));
  };

  const isSelfEvaluationComplete = () => {
    const allCriteria = [
      ...Object.values(selfEvaluationData.postureCriteria),
      ...Object.values(selfEvaluationData.executionCriteria),
      ...Object.values(selfEvaluationData.peopleAndManagementCriteria)
    ];
    
    return allCriteria.every(criterion => 
      criterion.score !== null && criterion.justification.trim() !== ''
    );
  };

  const clearAllData = () => {
    setEvaluations360([]);
    setMentoringData({
      mentor: null,
      rating: 0,
      justification: '',
      isSubmitted: false,
      collapsed: false,
    });
    setSelfEvaluationData({
      postureCriteria: {
        sentimentoDeDono: { score: null, justification: '' },
        resilienciaNasAdversidades: { score: null, justification: '' },
        organizacaoNoTrabalho: { score: null, justification: '' },
        capacidadeDeAprender: { score: null, justification: '' },
        serTeamPlayer: { score: null, justification: '' },
      },
      executionCriteria: {
        entregarComQualidade: { score: null, justification: '' },
        atenderAosPrazos: { score: null, justification: '' },
        fazerMaisComMenos: { score: null, justification: '' },
        pensarForaDaCaixa: { score: null, justification: '' },
      },
      peopleAndManagementCriteria: {
        gente: { score: null, justification: '' },
        resultados: { score: null, justification: '' },
        evolucaoDaRocketCorp: { score: null, justification: '' },
      },
      isSubmitted: false,
      cardStates: {
        posture: false,
        execution: false,
        peopleAndManagement: false,
      },
      expandedItems: {},
    });
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS_360);
    localStorage.removeItem(STORAGE_KEYS.MENTORING_DATA);
    localStorage.removeItem(STORAGE_KEYS.SELF_EVALUATION_DATA);
    console.log('🧹 Todos os dados de avaliação foram limpos.');
  };

  useEffect(() => {
    if (!user) {
      clearAllData();
    }
  }, [user]);

  const value: EvaluationContextType = {
    evaluations360,
    addEvaluation360,
    updateEvaluation360,
    removeEvaluation360,
    submitEvaluation360,
    toggleEvaluation360Collapsed,
    mentoringData,
    setMentor,
    updateMentoringData,
    submitMentoring,
    toggleMentoringCollapsed,
    selfEvaluationData,
    updateSelfEvaluationCriterion,
    toggleSelfEvaluationCard,
    toggleSelfEvaluationItem,
    submitSelfEvaluation,
    isSelfEvaluationComplete,
    getEvaluation360ByCollaborator,
    isEvaluation360Complete,
    isMentoringComplete,
    clearAllData,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
}; 