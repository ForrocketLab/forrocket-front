import React from 'react';

interface Collaborator {
  id: string;
  name: string;
  role: string;
}

interface SearchResultsProps {
  results: Collaborator[];
  onSelect: (collaborator: Collaborator) => void;
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 mt-2 bg-white rounded-lg shadow-lg">Carregando...</div>;
  }
  
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full max-w-md mt-1 bg-white rounded-lg shadow-lg">
      <ul className="py-1">
        {results.map((collab) => (
          <li
            key={collab.id}
            onClick={() => onSelect(collab)}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          >
            <p className="font-semibold">{collab.name}</p>
            <p className="text-sm text-gray-600">{collab.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;