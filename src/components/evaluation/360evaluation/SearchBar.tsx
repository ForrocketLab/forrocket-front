import React from 'react';
import { IoMdSearch } from 'react-icons/io';
import type { EvaluableUser } from '../../../types/evaluations';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  searchResults: EvaluableUser[];
  onSelect: (collaborator: EvaluableUser) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, searchResults, onSelect, onFocus, onBlur }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IoMdSearch className="h-4 w-4 text-[#1D1D1DBF]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-3 rounded-xl text-sm leading-5 bg-[#FFFFFF80] text-[#1D1D1DBF] placeholder:text-[#1D1D1DBF] focus:outline-none border-none"
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