import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import EvaluationCard from './EvaluationCard';
import EvaluationService from '../../../services/EvaluationService';
import { useEvaluation } from '../../../contexts/EvaluationProvider';
import type { EvaluableUser } from '../../../types/evaluations';

const Evaluation360 = () => {
  const [search, setSearch] = useState('');
  const [availableCollaborators, setAvailableCollaborators] = useState<EvaluableUser[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    evaluations360,
    addEvaluation360,
    removeEvaluation360,
    submitEvaluation360,
  } = useEvaluation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { colleagues, managers } = await EvaluationService.getEvaluableUsers();
        const allEvaluableUsers = [...colleagues, ...managers];
        
        // Filtrar colaboradores que já estão sendo avaliados
        const evaluatedCollaboratorIds = evaluations360.map(evaluation => evaluation.collaborator.id);
        const availableUsers = allEvaluableUsers.filter(
          user => !evaluatedCollaboratorIds.includes(user.id)
        );
        
        setAvailableCollaborators(availableUsers);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [evaluations360]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectCollaborator = (collaborator: EvaluableUser) => {
    addEvaluation360(collaborator);
    setSearch('');
    setIsSearchActive(false);
  };

  const handleRemove = (collaboratorToRemove: EvaluableUser) => {
    removeEvaluation360(collaboratorToRemove.id);
  };
  
  const handleSubmitted = (submittedCollaborator: EvaluableUser) => {
    submitEvaluation360(submittedCollaborator.id);
  }

  const searchResults = isSearchActive
    ? availableCollaborators.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];
    
  if (isLoading) {
    return <p>Carregando colaboradores...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="bg=[#F1F1F1] min-h-screen">
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por colaboradores"
          searchResults={searchResults}
          onSelect={handleSelectCollaborator}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setTimeout(() => setIsSearchActive(false), 150)}
        />
      </div>
      {evaluations360.map((evaluation) => (
        <EvaluationCard 
            key={evaluation.collaborator.id} 
            collaborator={evaluation.collaborator} 
            onRemove={() => handleRemove(evaluation.collaborator)}
            onSubmitted={() => handleSubmitted(evaluation.collaborator)}
        />
      ))}
    </div>
  );
};

export default Evaluation360;
