import { type FC, useState, useRef, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  // Estado para guardar o estilo (posição e largura) da barrinha indicadora
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Array de Refs para guardar a referência de cada elemento de botão da aba
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Efeito que roda sempre que a aba ativa muda
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabRef = tabRefs.current[activeIndex];

    if (activeTabRef) {
      setIndicatorStyle({
        left: activeTabRef.offsetLeft,
        width: activeTabRef.offsetWidth,
      });
    }
  }, [activeTab, tabs]); // Roda quando a aba ativa ou a lista de abas muda

  return (
    <div className='bg-white border-b border-gray-200'>
      <nav className='relative flex items-center'>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={el => {
                tabRefs.current[index] = el;
              }}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-4 px-6 text-center transition-colors duration-200 ease-in-out focus:outline-none hover:cursor-pointer z-10
               ${isActive ? 'font-bold text-teal-600' : 'font-medium text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          );
        })}

        <span
          className='absolute bottom-0 h-1 bg-teal-600 transition-all duration-300 ease-in-out'
          style={indicatorStyle}
        ></span>
      </nav>
    </div>
  );
};

export default TabNavigation;
