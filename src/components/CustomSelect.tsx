import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  className?: string;
}

const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const CustomSelect = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  className,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find(option => option.value === value) || null,
  );
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const option = options.find(option => option.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && (
        <label htmlFor={id} className='text-sm font-medium text-gray-700 whitespace-nowrap'>
          {label}
        </label>
      )}

      <div className='relative' ref={selectRef}>
        {/* Trigger */}
        <button
          id={id}
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between min-w-[160px] px-3 py-2',
            'bg-white border border-gray-300 rounded-md shadow-sm',
            'text-sm text-gray-900',
            'transition-all duration-200 ease-out',
            'hover:border-blue-500 hover:shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            isOpen && 'border-blue-500 ring-2 ring-blue-500/20',
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-gray-500')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 ml-2 text-gray-500 transition-transform duration-200',
              isOpen && 'rotate-180 text-blue-500',
            )}
          />
        </button>

        {/* Dropdown */}
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 z-50',
            'bg-white border border-gray-300 rounded-md shadow-lg',
            'transition-all duration-200 ease-out origin-top',
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none',
          )}
        >
          <div className='py-1 max-h-60 overflow-auto'>
            {options.map(option => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm',
                  'transition-all duration-150',
                  'hover:bg-blue-50 hover:text-blue-700',
                  'focus:outline-none focus:bg-blue-50 focus:text-blue-700',
                  selectedOption?.value === option.value && 'bg-blue-500 text-white font-medium',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
