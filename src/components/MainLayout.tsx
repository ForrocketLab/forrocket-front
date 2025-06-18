import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';

const MainLayout = () => {
  return (
    <div className='flex h-screen bg-gray-100'>
      <SideMenu />
      <main className='flex-1 p-8 overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
