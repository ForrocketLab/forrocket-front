import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { LuLayoutDashboard, LuFilePenLine } from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";

const Sidebar = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth) return null;

  return (
    <aside className="fixed top-0 left-0 h-full w-[232px] bg-white flex flex-col justify-between py-4 z-20 border-r-2 border-[#D9D9D9]">
      <div>
        {/* rpe */}
        <div className="flex items-center gap-2 px-4 py-2 mb-6">
          <div className="w-6 h-6 bg-[#085F60] rounded" />
          <span className="font-bold text-xl text-[#085F60]">RPE</span>
        </div>
        {/* navigation */}
        <nav className="flex flex-col gap-1">
          <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${location.pathname === '/' ? 'bg-teal-100 text-[#085F60] font-bold' : 'text-gray-700 hover:bg-gray-100'}`}> 
            <LuLayoutDashboard className={`text-base w-6 h-6 ${location.pathname === '/' ? 'text-[#085F60]' : 'text-gray-700 group-hover:text-[#085F60]'}`} />
            <span>Dashboard</span>
          </Link>
          <Link to="/avaliacao" className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${location.pathname === '/avaliacao' ? 'bg-teal-100 text-[#085F60] font-bold' : 'text-gray-700 hover:bg-gray-100'}`}> 
            <LuFilePenLine className={`text-base w-6 h-6 ${location.pathname === '/avaliacao' ? 'text-[#085F60]' : 'text-gray-700 group-hover:text-[#085F60]'}`} />
            <span>Avaliação de ciclo</span>
          </Link>
          <Link to="/evolucao" className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${location.pathname === '/evolucao' ? 'bg-teal-100 text-[#085F60] font-bold' : 'text-gray-700 hover:bg-gray-100'}`}> 
            <IoBarChartOutline className={`text-base w-6 h-6 ${location.pathname === '/evolucao' ? 'text-[#085F60]' : 'text-gray-700 group-hover:text-[#085F60]'}`} />
            <span>Evolução</span>
          </Link>
        </nav>
      </div>
      {/* user and logout */}
      <div className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          {auth.user && (
            <span className="bg-gray-200 rounded-full p-2 w-8 h-8 flex items-center justify-center font-bold text-[#085F60] text-sm uppercase">
              {auth.user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </span>
          )}
          <span className="text-sm font-bold">Colaborador 1</span>
        </div>
        <button onClick={auth.logout} className="flex items-center gap-2 text-[#08605F] hover:text-[#08605F] text-sm font-bold">
          <MdLogout className="text-base w-6 h-6" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 