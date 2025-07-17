import { useState } from 'react';
import PersonalInsightsService, { 
  type PersonalInsightsRequest, 
  type PersonalInsightsResponse 
} from '../services/PersonalInsightsService';

export const usePersonalInsights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<PersonalInsightsResponse | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  const checkExistingInsights = async (collaboratorId: string, cycle: string) => {
    try {
      setCheckingExisting(true);
      setError(null);
      
      const existingInsights = await PersonalInsightsService.getExistingPersonalInsight(collaboratorId, cycle);
      setInsights(existingInsights);
      return existingInsights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setCheckingExisting(false);
    }
  };

  const generateInsights = async (data: PersonalInsightsRequest) => {
    try {
      setLoading(true);
      setError(null);
      setInsights(null);
      
      const result = await PersonalInsightsService.generatePersonalInsights(data);
      setInsights(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearInsights = () => {
    setInsights(null);
    setError(null);
  };

  return { 
    generateInsights, 
    checkExistingInsights,
    clearInsights,
    insights, 
    loading, 
    checkingExisting,
    error 
  };
}; 