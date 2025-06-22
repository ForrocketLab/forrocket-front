import { createContext, useState, useContext, useEffect, type FC, type ReactNode } from 'react';
import type { EvaluableUser } from '../types/evaluations';


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
} as const;

export const EvaluationProvider: FC<EvaluationProviderProps> = ({ children }) => {
  const [evaluations360, setEvaluations360] = useState<Evaluation360Data[]>([]);
  const [mentoringData, setMentoringData] = useState<MentoringData>({
    mentor: null,
    rating: 0,
    justification: '',
    isSubmitted: false,
    collapsed: false,
  });


  useEffect(() => {
    try {
      const storedEvaluations360 = localStorage.getItem(STORAGE_KEYS.EVALUATIONS_360);
      if (storedEvaluations360) {
        setEvaluations360(JSON.parse(storedEvaluations360));
      }

      const storedMentoringData = localStorage.getItem(STORAGE_KEYS.MENTORING_DATA);
      if (storedMentoringData) {
        setMentoringData(JSON.parse(storedMentoringData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS_360, JSON.stringify(evaluations360));
    } catch (error) {
      console.error('Erro ao salvar avaliações 360 no localStorage:', error);
    }
  }, [evaluations360]);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENTORING_DATA, JSON.stringify(mentoringData));
    } catch (error) {
      console.error('Erro ao salvar dados de mentoring no localStorage:', error);
    }
  }, [mentoringData]);


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


  const clearAllData = () => {
    setEvaluations360([]);
    setMentoringData({
      mentor: null,
      rating: 0,
      justification: '',
      isSubmitted: false,
      collapsed: false,
    });
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS_360);
    localStorage.removeItem(STORAGE_KEYS.MENTORING_DATA);
  };

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