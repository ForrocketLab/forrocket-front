import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';

const MainLayout = () => {
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
    // Limpa o event listener quando o componente é desmontado
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // O container principal não precisa mais de flex, pois o SideMenu é 'fixed'
    <div className='bg-[#F1F1F1]'>
      {/* Passa o estado e a função de toggle para o SideMenu */}
      <SideMenu isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

      {/* A margem do conteúdo principal agora é dinâmica */}
      <main
        className={`h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-20' // 256px -> w-64, 80px -> w-20
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
