import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBarEvaluations = ({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) => {
  return (
    <div className='relative w-full'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        <Search className='h-5 w-5 text-gray-400' />
      </div>
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className='w-full rounded-lg border border-gray-200 bg-white p-4 pl-12 pr-4 text-gray-800 shadow-sm transition-all duration-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500'
      />
    </div>
  );
};

export default SearchBarEvaluations;
