import { useState, useEffect } from 'react';
import CommitteeService, { 
  type CollaboratorsResponse, 
  type CollaboratorEvaluationSummary,
  type CommitteeMetrics,
  type CreateCommitteeAssessment,
  type UpdateCommitteeAssessment
} from '../services/CommitteeService';

export const useCommitteeCollaborators = () => {
  const [data, setData] = useState<CollaboratorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CommitteeService.getCollaboratorsForEqualization();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  return { data, loading, error, refetch: fetchCollaborators };
};

export const useCollaboratorEvaluationSummary = (collaboratorId: string | null) => {
  const [data, setData] = useState<CollaboratorEvaluationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collaboratorId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const summary = await CommitteeService.getCollaboratorEvaluationSummary(collaboratorId);
        setData(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collaboratorId]);

  return { data, loading, error };
};

export const useCommitteeAssessmentActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssessment = async (data: CreateCommitteeAssessment) => {
    try {
      setLoading(true);
      setError(null);
      const result = await CommitteeService.createCommitteeAssessment(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (assessmentId: string, data: UpdateCommitteeAssessment) => {
    try {
      setLoading(true);
      setError(null);
      const result = await CommitteeService.updateCommitteeAssessment(assessmentId, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async (assessmentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await CommitteeService.submitCommitteeAssessment(assessmentId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createAssessment, updateAssessment, submitAssessment, loading, error };
};

export const useCommitteeMetrics = () => {
  const [data, setData] = useState<CommitteeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CommitteeService.getMetrics();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { data, loading, error, refetch: fetchMetrics };
}; 