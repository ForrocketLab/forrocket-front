import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import HomeService, { UserOverview } from '../../services/HomeService';
import { 
  LuUsers, 
  LuCalendar, 
  LuTrendingUp, 
  LuTarget, 
  LuStar, 
  LuAward,
  LuArrowRight,
  LuRocket,
  LuActivity,
  LuFileText,
  LuMessageSquare,
  LuSettings,
  LuUserCheck,
  LuUserPlus,
  LuUserMinus
} from 'react-icons/lu';
import { 
  FaProjectDiagram, 
  FaUsers, 
  FaChartLine, 
  FaTrophy,
  FaRegLightbulb
} from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';
import { BiTargetLock } from 'react-icons/bi';

// Removendo interfaces duplicadas - agora importadas do HomeService

const HomePage = () => {
  const auth = useContext(AuthContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userOverview, setUserOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Buscar dados reais da API
        const data = await HomeService.getHomeData();
        
        setUserOverview(data.userOverview);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!auth) return <p>Contexto não disponível</p>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#085F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'LEADER': 'bg-purple-100 text-purple-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'COLLABORATOR': 'bg-gray-100 text-gray-800',
      'MENTOR': 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      'LEADER': <LuTarget className="w-4 h-4" />,
      'MANAGER': <LuUsers className="w-4 h-4" />,
      'COLLABORATOR': <LuUserCheck className="w-4 h-4" />,
      'MENTOR': <LuAward className="w-4 h-4" />
    };
    return icons[role as keyof typeof icons] || <LuUserCheck className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      {/* Header com saudação */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#085F60] via-teal-600 to-green-600 opacity-10"></div>
        <div className="relative px-6 py-8 md:px-12 md:py-12">
          <div className="flex items-center justify-between">
            {/* Texto de boas-vindas */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Olá, <span className="text-[#085F60]">{user?.name?.split(' ')[0] || 'Usuário'}!</span>
              </h1>
              <p className="text-lg text-gray-600">
                Seja bem-vindo ao RPE
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 bg-[#085F60] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span className="text-sm text-gray-600">
                  {user?.roles?.join(', ') || 'Usuário'}
                </span>
              </div>
            </div>
            
            {/* Ícone animado do RPE */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#085F60] to-teal-600 rounded-2xl flex items-center justify-center animate-pulse">
              <div className="text-white font-bold text-xl tracking-wider">
                RPE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Ações rápidas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <LuSettings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
                <p className="text-sm text-gray-600">Acesse rapidamente as principais funcionalidades</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/avaliacao')}
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#085F60] hover:bg-teal-50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#085F60] to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LuFileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Avaliações</h3>
                    <p className="text-sm text-gray-600">Ciclo atual</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/evolution')}
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#085F60] hover:bg-teal-50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LuTrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Evolução</h3>
                    <p className="text-sm text-gray-600">Métricas e relatórios</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/okrs')}
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#085F60] hover:bg-teal-50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BiTargetLock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">OKRs</h3>
                    <p className="text-sm text-gray-600">Objetivos e resultados</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/pdis')}
                className="group p-4 rounded-xl border border-gray-200 hover:border-[#085F60] hover:bg-teal-50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LuFileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">PDIs</h3>
                    <p className="text-sm text-gray-600">Plano de desenvolvimento</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Seção de projetos */}
          {userOverview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Projetos */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#085F60] to-teal-600 rounded-xl flex items-center justify-center">
                    <FaProjectDiagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Meus Projetos</h2>
                    <p className="text-sm text-gray-600">Projetos em que você está envolvido</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {userOverview.projects.map((project) => (
                    <div key={project.id} className="group p-4 rounded-xl border border-gray-200 transition-all duration-300">
                                              <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          
                          {/* Roles do usuário */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {project.userRoles.map((role) => (
                              <span
                                key={role}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                              >
                                {getRoleIcon(role)}
                                {role}
                              </span>
                            ))}
                          </div>

                          {/* Informações de liderança e gestão */}
                          <div className="mt-3 space-y-2">
                            {/* Lógica baseada no papel do usuário no projeto */}
                            {(() => {
                              // Se for LÍDER: mostra apenas o GESTOR (se tiver)
                              if (project.isLeaderInProject) {
                                return project.projectManager ? (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <LuUsers className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-800">Gestor do Projeto</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {project.projectManager.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-900">{project.projectManager.name}</p>
                                        <p className="text-xs text-gray-600">{project.projectManager.jobTitle} • Gestor</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              }
                              
                              // Se for GESTOR: mostra apenas o LÍDER (se tiver)
                              if (project.isManagerInProject) {
                                return project.projectLeader ? (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <LuUsers className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-800">Líder do Projeto</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {project.projectLeader.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-900">{project.projectLeader.name}</p>
                                        <p className="text-xs text-gray-600">{project.projectLeader.jobTitle} • Líder</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              }
                              
                              // Se for COLABORADOR: mostra tanto LÍDER quanto GESTOR (se tiverem)
                              if (!project.isLeaderInProject && !project.isManagerInProject) {
                                return (project.projectLeader || project.projectManager) ? (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <LuUsers className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-800">Liderança do Projeto</span>
                                    </div>
                                    <div className="space-y-2">
                                      {project.projectLeader && (
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            {project.projectLeader.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-gray-900">{project.projectLeader.name}</p>
                                            <p className="text-xs text-gray-600">{project.projectLeader.jobTitle} • Líder</p>
                                          </div>
                                        </div>
                                      )}
                                      {project.projectManager && (
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            {project.projectManager.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-gray-900">{project.projectManager.name}</p>
                                            <p className="text-xs text-gray-600">{project.projectManager.jobTitle} • Gestor</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : null;
                              }
                              
                              return null;
                            })()}
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relacionamentos */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Relacionamentos</h2>
                    <p className="text-sm text-gray-600">Mentoria e gestão</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mentor */}
                  {userOverview.hasMentor && userOverview.mentor && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <LuUserPlus className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Seu Mentor</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {userOverview.mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userOverview.mentor.name}</p>
                          <p className="text-sm text-gray-600">{userOverview.mentor.jobTitle}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mentorados */}
                  {userOverview.isMentor && userOverview.mentees.length > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <LuUserMinus className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Seus Mentorados</h3>
                      </div>
                      <div className="space-y-3">
                        {userOverview.mentees.map((mentee) => (
                          <div key={mentee.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {mentee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{mentee.name}</p>
                              <p className="text-sm text-gray-600">{mentee.jobTitle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   

                   {/* Pessoas Lideradas - Se for líder */}
                   {userOverview.isLeader && (
                     <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
                       <div className="flex items-center gap-3 mb-3">
                         <LuTarget className="w-5 h-5 text-purple-600" />
                         <h3 className="font-semibold text-gray-900">Pessoas Lideradas</h3>
                       </div>
                       <div className="space-y-3">
                         {userOverview.projects
                           .filter(project => project.isLeaderInProject && project.ledSubordinates.length > 0)
                           .map(project => (
                             <div key={project.id} className="space-y-2">
                               <h4 className="text-sm font-medium text-purple-800">{project.name}</h4>
                               {project.ledSubordinates.map((led) => (
                                 <div key={led.id} className="flex items-center gap-3 ml-2">
                                   <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                     {led.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                   </div>
                                   <div>
                                     <p className="text-sm font-medium text-gray-900">{led.name}</p>
                                     <p className="text-xs text-gray-600">{led.jobTitle}</p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ))}
                         {userOverview.projects
                           .filter(project => project.isLeaderInProject && project.ledSubordinates.length > 0)
                           .length === 0 && (
                           <p className="text-sm text-gray-600">Nenhuma pessoa liderada encontrada nos projetos ativos.</p>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Subordinados Gerenciados - Se for gestor */}
                   {userOverview.isManager && (
                     <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                       <div className="flex items-center gap-3 mb-3">
                         <LuUsers className="w-5 h-5 text-blue-600" />
                         <h3 className="font-semibold text-gray-900">Subordinados Gerenciados</h3>
                       </div>
                       <div className="space-y-3">
                         {userOverview.projects
                           .filter(project => project.isManagerInProject && project.managedSubordinates.length > 0)
                           .map(project => (
                             <div key={project.id} className="space-y-2">
                               <h4 className="text-sm font-medium text-blue-800">{project.name}</h4>
                               {project.managedSubordinates.map((subordinate) => (
                                 <div key={subordinate.id} className="flex items-center gap-3 ml-2">
                                   <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                     {subordinate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                   </div>
                                   <div>
                                     <p className="text-sm font-medium text-gray-900">{subordinate.name}</p>
                                     <p className="text-xs text-gray-600">{subordinate.jobTitle}</p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ))}
                         {userOverview.projects
                           .filter(project => project.isManagerInProject && project.managedSubordinates.length > 0)
                           .length === 0 && (
                           <p className="text-sm text-gray-600">Nenhum subordinado encontrado nos projetos ativos.</p>
                         )}
                       </div>
                     </div>
                   )}
                </div>
              </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
