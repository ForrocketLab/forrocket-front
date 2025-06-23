import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';

const MainLayout = () => {
  return (
    <div className='h-screen bg-[#F1F1F1]'>
      <SideMenu />
      <main className='ml-[256px] p-8 h-full overflow-y-auto'>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
