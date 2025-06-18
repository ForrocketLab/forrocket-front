import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SIDE_MENU_CONFIG } from '../config/menuConfig';

const SideMenu = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  const accessibleMenuItems = SIDE_MENU_CONFIG.filter(item =>
    item.allowedRoles.some(allowedRole => userRoles.includes(allowedRole)),
  );

  return (
    <aside className='w-64 bg-gray-800 text-white flex flex-col p-4'>
      <h2 className='text-2xl font-bold mb-8'>RPE</h2>
      <nav>
        <ul>
          {accessibleMenuItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
                    isActive ? 'bg-green-600' : ''
                  }`
                }
              >
                <item.icon size={20} className='mr-3' />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideMenu;
