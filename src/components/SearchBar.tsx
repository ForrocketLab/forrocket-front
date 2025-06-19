
import { LuSearch } from 'react-icons/lu';
import type { ChangeEvent, FormEvent } from 'react';


interface SearchBarProps {
  value: string; 
  onChange: (newValue: string) => void; 
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, onSearch, placeholder = "Buscar por colaboradores" }: SearchBarProps) => {

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {

    onChange(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSearch) {

      onSearch(value);
    }

    console.log('Pesquisando por:', value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LuSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"

          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 rounded-2xl leading-5 bg-gray-50 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-[#085F60] sm:text-sm"
        />
      </div>
    </form>
  );
};

export default SearchBar;