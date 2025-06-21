import React, { useState } from 'react';
import SearchBar from './SearchBar';
import EvaluationCard from './EvaluationCard';

// mock data, before integration
const allCollaborators = [
  { id: 1, name: 'Ana Oliveira', role: 'Product Design', initials: 'AO' },
  { id: 2, name: 'Bruno Costa', role: 'Frontend Developer', initials: 'BC' },
  { id: 3, name: 'Carla Dias', role: 'Backend Developer', initials: 'CD' },
  { id: 4, name: 'Daniel Martins', role: 'QA Tester', initials: 'DM' },
  { id: 5, name: 'Eduarda Ferreira', role: 'DevOps Engineer', initials: 'EF' },
];

const Evaluation360 = () => {
  const [search, setSearch] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<typeof allCollaborators>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectCollaborator = (collaborator: (typeof allCollaborators)[0]) => {
    if (!selectedCollaborators.find(c => c.id === collaborator.id)) {
      setSelectedCollaborators([...selectedCollaborators, collaborator]);
    }
    setSearch('');
    setIsSearchActive(false);
  };

  const handleRemove = (id: number) => {
    setSelectedCollaborators(selectedCollaborators.filter((c) => c.id !== id));
  };

  const availableCollaborators = allCollaborators.filter(
    c => !selectedCollaborators.find(sc => sc.id === c.id)
  );

  const searchResults = isSearchActive
    ? availableCollaborators.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
        <EvaluationCard key={collaborator.id} collaborator={collaborator} onRemove={() => handleRemove(collaborator.id)} />
      ))}
    </div>
  );
};

export default Evaluation360;
