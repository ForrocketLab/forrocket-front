import { useState, type FormEvent } from 'react'; 

const NAV_BUTTONS = ['Autoavaliação', 'Avaliação 360', 'Mentoring', 'Referências'] as const;
type NavButtonType = typeof NAV_BUTTONS[number]

interface TopbarProps {
  onSave: (event: FormEvent) => void;
  isSaveDisabled: boolean;
}

const Topbar = ({ onSave, isSaveDisabled }: TopbarProps) => {

    const [activeButton, setActiveButton] = useState<NavButtonType>('Referências');

    const handleNavButtonClick = (buttonName: NavButtonType) => {
    setActiveButton(buttonName);

    }

    return (
    <>
        <main className='fixed top-0 left-[232px] right-0 bg-white z-10'>
            <header className='h-20 w-full flex items-center justify-between border-b border-[#f3f3f3] text-lg '>
                <h1 className='ml-20 text-black font-bold'>Ciclo 2025.1</h1>
                <button 
                    onClick={onSave}
                    disabled={isSaveDisabled}
                    className={`text-white cursor-pointer font-medium text-sm py-2 px-6 mr-5 rounded-sm transition-colors
                        ${isSaveDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#085F60] hover:bg-[#086014d5]'}`}
                >
                     Concluir e enviar
                </button>
            </header>

            <div className='bg-white h-10 flex items-center pl-30 pr-120 font-sm justify-between text-black'>
            {NAV_BUTTONS.map((buttonName) => (
                <button
                    key={buttonName}
                    onClick={() => handleNavButtonClick(buttonName)}
                    className={`font-medium text-sm cursor-pointer hover:text-[#085F60] hover:font-semibold transition-all
                                ${activeButton === buttonName ? 'text-[#085F60] font-semibold underline underline-offset-4 decoration-2' : 'text-gray-700'}`}
                >
                    {buttonName}
                </button>
            ))}
        </div>
    </main> 
    </>
    );
};


export default Topbar;