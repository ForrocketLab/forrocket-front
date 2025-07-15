import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { ReferenceAssessmentDto } from '../services/EvaluationService';

// Tipos para o estado das avaliações
export interface SelfAssessmentData {
  [criterionId: string]: {
    score: number;
    justification: string;
  };
}

export interface Evaluation360Data {
  [colleagueId: string]: {
    rating: number;
    strengths: string;
    improvements: string;
    workAgainMotivation: string;
  };
}

export interface MentoringData {
  [mentorId: string]: {
    rating: number;
    justification: string;
  };
}

export interface EvaluationState {
  selfAssessment: SelfAssessmentData;
  evaluation360: Evaluation360Data;
  mentoring: MentoringData;
  references: ReferenceAssessmentDto[];
  completionStatus: {
    selfAssessment: boolean;
    evaluation360: boolean;
    mentoring: boolean;
    references: boolean;
  };
  isLoading: boolean;
}

// Ações para o reducer
export type EvaluationAction =
  | { type: 'SET_SELF_ASSESSMENT'; payload: SelfAssessmentData }
  | { type: 'UPDATE_SELF_ASSESSMENT'; payload: { criterionId: string; score: number; justification: string } }
  | { type: 'SET_EVALUATION_360'; payload: Evaluation360Data }
  | { type: 'UPDATE_EVALUATION_360'; payload: { colleagueId: string; data: Partial<Evaluation360Data[string]> } }
  | { type: 'SET_MENTORING'; payload: MentoringData }
  | { type: 'UPDATE_MENTORING'; payload: { mentorId: string; data: Partial<MentoringData[string]> } }
  | { type: 'SET_REFERENCES'; payload: ReferenceAssessmentDto[] }
  | { type: 'UPDATE_REFERENCES'; payload: ReferenceAssessmentDto[] }
  | { type: 'ADD_REFERENCE'; payload: ReferenceAssessmentDto }
  | { type: 'REMOVE_REFERENCE'; payload: string }
  | { type: 'UPDATE_REFERENCE_JUSTIFICATION'; payload: { id: string; justification: string } }
  | { type: 'UPDATE_COMPLETION_STATUS'; payload: Partial<EvaluationState['completionStatus']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_FROM_STORAGE' };

// Estado inicial
const initialState: EvaluationState = {
  selfAssessment: {},
  evaluation360: {},
  mentoring: {},
  references: [],
  completionStatus: {
    selfAssessment: false,
    evaluation360: false,
    mentoring: false,
    references: false,
  },
  isLoading: false,
};

// Reducer
function evaluationReducer(state: EvaluationState, action: EvaluationAction): EvaluationState {
  switch (action.type) {
    case 'SET_SELF_ASSESSMENT':
      return { ...state, selfAssessment: action.payload };

    case 'UPDATE_SELF_ASSESSMENT':
      return {
        ...state,
        selfAssessment: {
          ...state.selfAssessment,
          [action.payload.criterionId]: {
            score: action.payload.score,
            justification: action.payload.justification,
          },
        },
      };

    case 'SET_EVALUATION_360':
      return { ...state, evaluation360: action.payload };

    case 'UPDATE_EVALUATION_360':
      return {
        ...state,
        evaluation360: {
          ...state.evaluation360,
          [action.payload.colleagueId]: {
            ...state.evaluation360[action.payload.colleagueId],
            ...action.payload.data,
          },
        },
      };

    case 'SET_MENTORING':
      return { ...state, mentoring: action.payload };

    case 'UPDATE_MENTORING':
      return {
        ...state,
        mentoring: {
          ...state.mentoring,
          [action.payload.mentorId]: {
            ...(state.mentoring[action.payload.mentorId] || {
              rating: 0,
              justification: '',
            }),
            ...action.payload.data,
          },
        },
      };

    case 'SET_REFERENCES':
      return { ...state, references: action.payload };

    case 'UPDATE_REFERENCES':
      return { ...state, references: action.payload };

    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, action.payload] };

    case 'REMOVE_REFERENCE':
      return { ...state, references: state.references.filter(ref => ref.id !== action.payload) };

    case 'UPDATE_REFERENCE_JUSTIFICATION':
      return {
        ...state,
        references: state.references.map(ref =>
          ref.id === action.payload.id ? { ...ref, justification: action.payload.justification } : ref,
        ),
      };

    case 'UPDATE_COMPLETION_STATUS':
      return {
        ...state,
        completionStatus: { ...state.completionStatus, ...action.payload },
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_FROM_STORAGE':
      try {
        const storedData = localStorage.getItem('evaluationData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          return { ...state, ...parsedData };
        }
      } catch (error) {
        console.error('Error loading evaluation data from storage:', error);
      }
      return state;

    default:
      return state;
  }
}

// Context
export const EvaluationContext = createContext<{
  state: EvaluationState;
  dispatch: React.Dispatch<EvaluationAction>;
} | null>(null);

// Provider
export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(evaluationReducer, initialState);

  // Carregar do localStorage na inicialização (apenas uma vez)
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('evaluationData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Só atualiza se houver dados válidos
        if (parsedData && typeof parsedData === 'object') {
          if (parsedData.selfAssessment) {
            dispatch({ type: 'SET_SELF_ASSESSMENT', payload: parsedData.selfAssessment });
          }
          if (parsedData.evaluation360) {
            dispatch({ type: 'SET_EVALUATION_360', payload: parsedData.evaluation360 });
          }
          if (parsedData.mentoring) {
            dispatch({ type: 'SET_MENTORING', payload: parsedData.mentoring });
          }
          if (parsedData.references) {
            dispatch({ type: 'SET_REFERENCES', payload: parsedData.references });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de avaliação do localStorage:', error);
    }
    // eslint-disable-next-line
  }, []);

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      const dataToStore = {
        selfAssessment: state.selfAssessment,
        evaluation360: state.evaluation360,
        mentoring: state.mentoring,
        references: state.references,
      };
      localStorage.setItem('evaluationData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Erro ao salvar dados de avaliação no localStorage:', error);
    }
  }, [state.selfAssessment, state.evaluation360, state.mentoring, state.references]);

  return <EvaluationContext.Provider value={{ state, dispatch }}>{children}</EvaluationContext.Provider>;
};

export default EvaluationContext;
