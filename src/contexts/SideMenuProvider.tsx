import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SideMenuContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SideMenuContext = createContext<SideMenuContextType | undefined>(undefined);

interface SideMenuProviderProps {
  children: ReactNode;
}

export const SideMenuProvider = ({ children }: SideMenuProviderProps) => {
  // O estado que controla se o menu está expandido ou não
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);

  // Função para alternar o estado
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  // Efeito para ajustar o estado do menu com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SideMenuContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SideMenuContext.Provider>
  );
};

export const useSideMenu = () => {
  const context = useContext(SideMenuContext);
  if (context === undefined) {
    throw new Error('useSideMenu must be used within a SideMenuProvider');
  }
  return context;
}; 