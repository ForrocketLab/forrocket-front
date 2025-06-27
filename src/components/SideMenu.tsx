import { NavLink } from 'react-router-dom';
import { LogOut, ChevronFirst, ChevronLast } from 'lucide-react';
import { SIDE_MENU_CONFIG } from '../config/menuConfig';
import { useAuth } from '../hooks/useAuth';

interface SideMenuProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SideMenu = ({ isExpanded, toggleSidebar }: SideMenuProps) => {
  const { user, logout } = useAuth();
  const userRoles = user?.roles || [];

  const accessibleMenuItems = SIDE_MENU_CONFIG.filter(item =>
    item.allowedRoles.some(allowedRole => userRoles.includes(allowedRole)),
  );

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    // A largura do container principal agora transiciona suavemente
    <aside
      className={`fixed top-0 left-0 flex h-full flex-col justify-between border-r-2 border-gray-100 bg-white py-4 z-20 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20' // 256px -> 80px
      }`}
    >
      <div>
        {/* Logo RPE e botão de toggle */}
        <div className='flex items-center justify-between px-4 py-2 mb-6'>
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ${isExpanded ? 'w-32' : 'w-0'}`}
          >
            <div className='w-6 h-6 bg-[#085F60] rounded flex-shrink-0' />
            <span className='font-bold text-xl text-[#085F60] whitespace-nowrap'>RPE</span>
          </div>
          <button
            onClick={toggleSidebar}
            className='p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:cursor-pointer'
          >
            {isExpanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* Navegação Dinâmica */}
        <nav className='flex flex-col gap-1 px-4'>
          {accessibleMenuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/committee' || item.path === '/rh' || item.path === '/manager/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-teal-100 text-[#085F60] font-bold' : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded && 'justify-center'}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#085F60]' : 'text-gray-600'}`}
                  />
                  {/* ▼▼▼ CORREÇÃO PRINCIPAL AQUI ▼▼▼ */}
                  <span
                    className={`overflow-hidden transition-all whitespace-nowrap ${isExpanded ? 'w-full ml-1' : 'w-0'}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Seção do Usuário e Logout */}
      <div className='flex flex-col gap-2 px-4 border-t-2 border-gray-100 pt-4'>
        {user && (
          <div className='flex items-center gap-3 text-gray-600'>
            <span className='bg-gray-200 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-[#085F60] text-sm uppercase'>
              {userInitials}
            </span>
            <div className={`flex flex-col overflow-hidden transition-all ${isExpanded ? 'w-full' : 'w-0'}`}>
              <span className='text-sm font-bold text-gray-800 whitespace-nowrap'>{user.name}</span>
              <span className='text-xs text-gray-500 whitespace-nowrap'>{user.jobTitle}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors ${
            !isExpanded && 'justify-center'
          }`}
        >
          <LogOut size={20} className='text-gray-600 flex-shrink-0' />
          <span className={`overflow-hidden transition-all whitespace-nowrap ${isExpanded ? 'w-full ml-1' : 'w-0'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SideMenu;
