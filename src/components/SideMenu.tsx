import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import { SIDE_MENU_CONFIG } from '../config/menuConfig';

const SideMenu = () => {
  const { user, logout } = useAuth();
  const userRoles = user?.roles || [];

  // Filtra o menu para mostrar apenas os itens que o usuário tem permissão para ver.
  const accessibleMenuItems = SIDE_MENU_CONFIG.filter(item =>
    item.allowedRoles.some(allowedRole => userRoles.includes(allowedRole)),
  );

  // Lógica para pegar as iniciais do nome do usuário
  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <aside className='fixed top-0 left-0 flex h-full w-[256px] flex-col justify-between border-r-2 border-[#D9D9D9] bg-white py-4 z-20'>
      <div>
        {/* Logo RPE */}
        <div className='flex items-center gap-2 px-4 py-2 mb-6'>
          <div className='w-6 h-6 bg-[#085F60] rounded' />
          <span className='font-bold text-xl text-[#085F60]'>RPE</span>
        </div>

        {/* Navegação Dinâmica */}
        <nav className='flex flex-col gap-1 px-4'>
          {accessibleMenuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={true} // Força correspondência exata da rota
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-teal-100 text-[#085F60] font-bold' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`transition-colors ${isActive ? 'text-[#085F60]' : 'text-gray-600'}`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Seção do Usuário e Logout */}
      <div className='flex flex-col gap-2 px-4 border-t-2 border-gray-100 pt-4'>
        {user && (
          <div className='flex items-center gap-3 text-gray-600 mb-2'>
            <span className='bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-[#085F60] text-sm uppercase'>
              {userInitials}
            </span>
            <div className='flex flex-col'>
              <span className='text-sm font-bold text-gray-800'>{user.name}</span>
              <span className='text-xs text-gray-500'>{user.jobTitle}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className='flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors hover:cursor-pointer'
        >
          <LogOut size={20} className='text-gray-600' />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SideMenu;
