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

// Helper function to get initials
const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

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
        {results.map((collab) => {
          const initials = getInitials(collab.name);
          return (
            <li
              key={collab.id}
              onClick={() => onSelect(collab)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3" // Increased padding and added gap
            >
              {/* Initials Circle */}
              <div className="flex-shrink-0">
                <span className='bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-[#085F60] text-xs uppercase'>
                  {initials}
                </span>
              </div>
              {/* Name and Role */}
              <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper truncation if needed */}
                <p className="font-semibold text-sm truncate">{collab.name}</p> {/* Added truncate */}
                <p className="text-xs text-gray-600 truncate">{collab.role}</p> {/* Added truncate */}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchResults;