import { useState, useEffect, useCallback } from 'react';
import HRService from '../services/HRService';
import type { CollaboratorDetailedEvolution } from '../types/evaluations';

interface EvolutionFilters {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filterBy: string;
}

export const useHistoricalEvolution = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [collaboratorDetails, setCollaboratorDetails] = useState<CollaboratorDetailedEvolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getEvolutionDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCollaborators = useCallback(async (filters?: EvolutionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getCollaboratorsEvolutionSummary(filters);
      setCollaborators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollaboratorDetails = useCallback(async (collaboratorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getCollaboratorDetailedEvolution(collaboratorId);
      setCollaboratorDetails(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do colaborador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const compareCollaborators = useCallback(async (params: {
    collaboratorIds: string[];
    cycles?: string[];
    pillar?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.compareCollaboratorsEvolution(params);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao comparar colaboradores');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrganizationalTrends = useCallback(async (params?: {
    startCycle?: string;
    endCycle?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getOrganizationalTrends(params);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tendências organizacionais');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboard,
    collaborators,
    collaboratorDetails,
    loading,
    error,
    loadDashboard,
    loadCollaborators,
    getCollaboratorDetails,
    compareCollaborators,
    getOrganizationalTrends,
    clearError: () => setError(null)
  };
};

export default useHistoricalEvolution; 