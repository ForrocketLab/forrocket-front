import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import EvaluationCard from './EvaluationCard';
import EvaluationService from '../../../services/EvaluationService';
import type { EvaluableUser } from '../../../types/evaluations';

const Evaluation360 = () => {
  const [search, setSearch] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<EvaluableUser[]>([]);
  const [availableCollaborators, setAvailableCollaborators] = useState<EvaluableUser[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { colleagues, managers } = await EvaluationService.getEvaluableUsers();
        const allEvaluableUsers = [...colleagues, ...managers];
        setAvailableCollaborators(allEvaluableUsers);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectCollaborator = (collaborator: EvaluableUser) => {
    if (!selectedCollaborators.find((c) => c.id === collaborator.id)) {
      setSelectedCollaborators([...selectedCollaborators, collaborator]);
      setAvailableCollaborators(availableCollaborators.filter((c) => c.id !== collaborator.id));
    }
    setSearch('');
    setIsSearchActive(false);
  };

  const handleRemove = (collaboratorToRemove: EvaluableUser) => {
    setSelectedCollaborators(selectedCollaborators.filter((c) => c.id !== collaboratorToRemove.id));
    setAvailableCollaborators([...availableCollaborators, collaboratorToRemove]);
  };
  
  const handleSubmitted = (submittedCollaborator: EvaluableUser) => {
      setSelectedCollaborators(selectedCollaborators.filter((c) => c.id !== submittedCollaborator.id));
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
      {selectedCollaborators.map((collaborator) => (
        <EvaluationCard 
            key={collaborator.id} 
            collaborator={collaborator} 
            onRemove={() => handleRemove(collaborator)}
            onSubmitted={() => handleSubmitted(collaborator)}
        />
      ))}
    </div>
  );
};

export default Evaluation360;
