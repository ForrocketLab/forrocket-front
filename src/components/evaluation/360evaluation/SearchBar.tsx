import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface Collaborator {
  id: number;
  name: string;
  role: string;
  initials: string;
}

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  searchResults: Collaborator[];
  onSelect: (collaborator: Collaborator) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, searchResults, onSelect, onFocus, onBlur }) => {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <FiSearch />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {searchResults.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
          {searchResults.map((collaborator) => (
            <li
              key={collaborator.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelect(collaborator)}
            >
              {collaborator.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar; 