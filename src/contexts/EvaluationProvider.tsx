import { createContext, useState, useContext, useEffect, type FC, type ReactNode } from 'react';
import type { EvaluableUser } from '../types/evaluations';
import { useAuth } from '../hooks/useAuth';

// --- INTERFACES DE DADOS ---
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

interface ReferenceFeedbackData {
  referencedUserId: string;
  referencedUserName: string;
  justification: string;
}

// --- TIPO DO CONTEXTO (COMPLETO) ---
interface EvaluationContextType {
  evaluations360: Evaluation360Data[];
  addEvaluation360: (collaborator: EvaluableUser) => void;
  updateEvaluation360: (collaboratorId: string, data: Partial<Omit<Evaluation360Data, 'collaborator'>>) => void;
  removeEvaluation360: (collaboratorId: string) => void;
  submitEvaluation360: (collaboratorId: string) => void;
  toggleEvaluation360Collapsed: (collaboratorId: string) => void;
  getEvaluation360ByCollaborator: (collaboratorId: string) => Evaluation360Data | undefined;
  isEvaluation360Complete: (collaboratorId: string) => boolean;

  mentoringData: MentoringData;
  setMentor: (mentor: EvaluableUser) => void;
  updateMentoringData: (data: Partial<Omit<MentoringData, 'mentor'>>) => void;
  submitMentoring: () => void;
  toggleMentoringCollapsed: () => void;
  isMentoringComplete: () => boolean;

  selfEvaluationData: SelfEvaluationData;
  updateSelfEvaluationCriterion: (group: 'posture' | 'execution' | 'peopleAndManagement', criterionName: string, field: 'score' | 'justification', value: any) => void;
  toggleSelfEvaluationCard: (card: 'posture' | 'execution' | 'peopleAndManagement') => void;
  toggleSelfEvaluationItem: (itemKey: string) => void;
  submitSelfEvaluation: () => void;
  isSelfEvaluationComplete: () => boolean;

  referenceFeedbackData: ReferenceFeedbackData[];
  addReferenceFeedback: (feedback: ReferenceFeedbackData) => void;
  removeReferenceFeedback: (referencedUserId: string) => void;
  isReferenceFeedbackComplete: () => boolean;

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
  REFERENCE_FEEDBACK: 'reference_feedback_data',
} as const;

export const EvaluationProvider: FC<EvaluationProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
    }
    return defaultValue;
  };

  const initialSelfEvaluationState = {
    postureCriteria: { sentimentoDeDono: { score: null, justification: '' }, resilienciaNasAdversidades: { score: null, justification: '' }, organizacaoNoTrabalho: { score: null, justification: '' }, capacidadeDeAprender: { score: null, justification: '' }, serTeamPlayer: { score: null, justification: '' } },
    executionCriteria: { entregarComQualidade: { score: null, justification: '' }, atenderAosPrazos: { score: null, justification: '' }, fazerMaisComMenos: { score: null, justification: '' }, pensarForaDaCaixa: { score: null, justification: '' } },
    peopleAndManagementCriteria: { gente: { score: null, justification: '' }, resultados: { score: null, justification: '' }, evolucaoDaRocketCorp: { score: null, justification: '' } },
    isSubmitted: false,
    cardStates: { posture: false, execution: false, peopleAndManagement: false },
    expandedItems: {},
  };

  const [evaluations360, setEvaluations360] = useState<Evaluation360Data[]>(() => loadFromStorage(STORAGE_KEYS.EVALUATIONS_360, []));
  const [mentoringData, setMentoringData] = useState<MentoringData>(() => loadFromStorage(STORAGE_KEYS.MENTORING_DATA, { mentor: null, rating: 0, justification: '', isSubmitted: false, collapsed: false }));
  const [selfEvaluationData, setSelfEvaluationData] = useState<SelfEvaluationData>(() => loadFromStorage(STORAGE_KEYS.SELF_EVALUATION_DATA, initialSelfEvaluationState));
  const [referenceFeedbackData, setReferenceFeedbackData] = useState<ReferenceFeedbackData[]>(() => loadFromStorage(STORAGE_KEYS.REFERENCE_FEEDBACK, []));

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EVALUATIONS_360, JSON.stringify(evaluations360)); }, [evaluations360]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MENTORING_DATA, JSON.stringify(mentoringData)); }, [mentoringData]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SELF_EVALUATION_DATA, JSON.stringify(selfEvaluationData)); }, [selfEvaluationData]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REFERENCE_FEEDBACK, JSON.stringify(referenceFeedbackData)); }, [referenceFeedbackData]);

  const addEvaluation360 = (collaborator: EvaluableUser) => { setEvaluations360(prev => [...prev, { collaborator, rating: 0, strengths: '', improvements: '', isSubmitted: false, collapsed: false }]); };
  const updateEvaluation360 = (collaboratorId: string, data: Partial<Omit<Evaluation360Data, 'collaborator'>>) => { setEvaluations360(prev => prev.map(e => e.collaborator.id === collaboratorId ? { ...e, ...data } : e)); };
  const removeEvaluation360 = (collaboratorId: string) => { setEvaluations360(prev => prev.filter(e => e.collaborator.id !== collaboratorId)); };
  const submitEvaluation360 = (collaboratorId: string) => { updateEvaluation360(collaboratorId, { isSubmitted: true }); };
  const toggleEvaluation360Collapsed = (collaboratorId: string) => { setEvaluations360(prev => prev.map(e => e.collaborator.id === collaboratorId ? { ...e, collapsed: !e.collapsed } : e)); };
  const getEvaluation360ByCollaborator = (collaboratorId: string) => evaluations360.find(e => e.collaborator.id === collaboratorId);
  const isEvaluation360Complete = (collaboratorId: string) => { const e = getEvaluation360ByCollaborator(collaboratorId); return e ? e.rating > 0 && e.strengths.trim() !== '' && e.improvements.trim() !== '' : false; };

  const setMentor = (mentor: EvaluableUser) => { setMentoringData(prev => ({ ...prev, mentor })); };
  const updateMentoringData = (data: Partial<Omit<MentoringData, 'mentor'>>) => { setMentoringData(prev => ({ ...prev, ...data })); };
  const submitMentoring = () => { setMentoringData(prev => ({ ...prev, isSubmitted: true })); };
  const toggleMentoringCollapsed = () => { setMentoringData(prev => ({ ...prev, collapsed: !prev.collapsed })); };
  const isMentoringComplete = () => mentoringData.rating > 0 && mentoringData.justification.trim() !== '';

  const updateSelfEvaluationCriterion = (group: 'posture' | 'execution' | 'peopleAndManagement', criterionName: string, field: 'score' | 'justification', value: any) => { setSelfEvaluationData(prev => { const newData = { ...prev }; const groupKey = `${group}Criteria` as const; (newData[groupKey] as any)[criterionName][field] = value; return newData; }); };
  const toggleSelfEvaluationCard = (card: 'posture' | 'execution' | 'peopleAndManagement') => { setSelfEvaluationData(prev => ({ ...prev, cardStates: { ...prev.cardStates, [card]: !prev.cardStates[card] } })); };
  const toggleSelfEvaluationItem = (itemKey: string) => { setSelfEvaluationData(prev => ({ ...prev, expandedItems: { ...prev.expandedItems, [itemKey]: !prev.expandedItems[itemKey] } })); };
  const submitSelfEvaluation = () => { setSelfEvaluationData(prev => ({ ...prev, isSubmitted: true })); };
  const isSelfEvaluationComplete = () => [...Object.values(selfEvaluationData.postureCriteria), ...Object.values(selfEvaluationData.executionCriteria), ...Object.values(selfEvaluationData.peopleAndManagementCriteria)].every(c => c.score !== null && c.justification.trim() !== '');

  const addReferenceFeedback = (feedback: ReferenceFeedbackData) => { setReferenceFeedbackData(prev => prev.some(f => f.referencedUserId === feedback.referencedUserId) ? prev : [...prev, feedback]); };
  const removeReferenceFeedback = (referencedUserId: string) => { setReferenceFeedbackData(prev => prev.filter(f => f.referencedUserId !== referencedUserId)); };
  const isReferenceFeedbackComplete = () => {
    const TOTAL_REFERENCES_REQUIRED = 1;
    return referenceFeedbackData.length >= TOTAL_REFERENCES_REQUIRED;
  };

  const clearAllData = () => {
    setEvaluations360([]);
    setMentoringData({ mentor: null, rating: 0, justification: '', isSubmitted: false, collapsed: false });
    setSelfEvaluationData(initialSelfEvaluationState);
    setReferenceFeedbackData([]);
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  };

  useEffect(() => { if (!user) clearAllData(); }, [user]);

  const value: EvaluationContextType = {
    evaluations360, addEvaluation360, updateEvaluation360, removeEvaluation360, submitEvaluation360, toggleEvaluation360Collapsed, getEvaluation360ByCollaborator, isEvaluation360Complete,
    mentoringData, setMentor, updateMentoringData, submitMentoring, toggleMentoringCollapsed, isMentoringComplete,
    selfEvaluationData, updateSelfEvaluationCriterion, toggleSelfEvaluationCard, toggleSelfEvaluationItem, submitSelfEvaluation, isSelfEvaluationComplete,
    referenceFeedbackData, addReferenceFeedback, removeReferenceFeedback, isReferenceFeedbackComplete,
    clearAllData,
  };

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
};