import { type FormEvent } from 'react';

const NAV_BUTTONS = ['Autoavaliação', 'Avaliação 360', 'Mentoring', 'Referências'] as const;
type NavButtonType = typeof NAV_BUTTONS[number]

interface TopbarProps {
  onSave: (event: FormEvent) => void;
  isSaveDisabled: boolean;
  activeButton: NavButtonType;
  onNavButtonClick: (buttonName: NavButtonType) => void;
}

const Topbar = ({ onSave, isSaveDisabled, activeButton, onNavButtonClick }: TopbarProps) => {
  return (
    <header className="bg-white shadow-sm mb-6">
      <div className="h-24 w-full flex items-center justify-between px-8 md:px-20">
        <h1 className="text-black font-bold text-lg md:text-xl">Ciclo 2025.1</h1>
        <button 
          onClick={onSave}
          disabled={isSaveDisabled}
          className={`text-white font-medium text-sm py-2 px-6 rounded-sm transition-colors
            ${isSaveDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#085F60] hover:bg-[#086014d5]'}
          `}
        >
          Concluir e enviar
        </button>
      </div>
      <nav className="bg-white h-12 flex items-center justify-between px-8 md:px-20 text-black border-t border-[#f3f3f3]">
        {NAV_BUTTONS.map((buttonName) => (
          <button
            key={buttonName}
            onClick={() => onNavButtonClick(buttonName)}
            className={`font-medium text-sm cursor-pointer hover:text-[#085F60] hover:font-semibold transition-all
              ${activeButton === buttonName ? 'text-[#085F60] font-semibold underline underline-offset-4 decoration-2' : 'text-gray-700'}`}
          >
            {buttonName}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Topbar;