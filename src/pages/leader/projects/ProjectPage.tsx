import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth'; // Hook para obter o usuário logado
import LeaderService, { ProjectDetails, ProjectListItem } from '../../../services/LeaderService';
import ProjectInfoCard from './components/ProjectInfoCard';
import ProductivityChart from './components/ProductivityChart';
import { FaProjectDiagram } from 'react-icons/fa';
import { LuCalendar1, LuUsersRound } from 'react-icons/lu';

const ProjectPage = () => {
  const { user } = useAuth(); // Obter o usuário logado
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectDetails | null>(null);
  
  // --- NOVOS ESTADOS ADICIONADOS ---
  const [burndownData, setBurndownData] = useState<any[]>([]); // Estado para os dados do gráfico
  const [loadingChart, setLoadingChart] = useState(false);   // Estado de loading para o gráfico

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar a LISTA de projetos do líder logado (sem alterações)
  useEffect(() => {
    if (!user?.id) return;

    const fetchProjectList = async () => {
      try {
        setLoadingList(true);
        setError(null);
        const list = await LeaderService.getProjectList(user.id);
        setProjectList(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].projectId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
      } finally {
        setLoadingList(false);
      }
    };
    fetchProjectList();
  }, [user]);

  // --- EFEITO ATUALIZADO PARA BUSCAR TUDO EM PARALELO ---
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchAllProjectData = async () => {
      setLoadingDetails(true);
      setLoadingChart(true);
      setError(null);

      try {
        // Busca os detalhes e os dados do gráfico ao mesmo tempo
        const [details, chartData] = await Promise.all([
          LeaderService.getProjectDetails(selectedProjectId),
          LeaderService.getBurndownData(selectedProjectId) // Função do LeaderService que você criou
        ]);
        
        setSelectedProjectData(details);
        setBurndownData(chartData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados do projeto.');
        setSelectedProjectData(null);
        setBurndownData([]);
      } finally {
        setLoadingDetails(false);
        setLoadingChart(false);
      }
    };

    fetchAllProjectData();
  }, [selectedProjectId]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(event.target.value);
  };
  
  if (loadingList) {
    return <div className="p-8 text-center">Carregando lista de projetos...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md flex mb-4 p-6 justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Projetos</h1>
        <div className="flex items-center gap-3">
          <FaProjectDiagram className="text-gray-500" />
          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#064b4c]"
            aria-label="Selecione um projeto"
            disabled={projectList.length === 0}
          >
            {projectList.length > 0 ? (
              projectList.map(project => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))
            ) : (
              <option>Nenhum projeto encontrado</option>
            )}
          </select>
        </div>
      </div>
      
      {loadingDetails ? (
        <div className="text-center p-8">Carregando detalhes do projeto...</div>
      ) : error ? (
        <div className="text-center p-8 text-red-600 bg-red-100 rounded-lg">{error}</div>
      ) : selectedProjectData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mx-3">
            <div className="md:col-span-1">
              <ProjectInfoCard 
                title="Data de Conclusão Prevista"
                description={<>Data final prevista para a entrega <br /> de todas as tarefas do projeto.</>}
                value={new Date(selectedProjectData.EndDate).toLocaleDateString('pt-BR',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  }
                )}
                icon={<LuCalendar1 size={32} />}
              />
            </div>
            <div className="md:col-span-1">
              <ProjectInfoCard 
                title="Colaboradores no Projeto"
                description="Número total de membros da equipe alocados neste projeto."
                value={selectedProjectData.CollaboratorsNumber}
                icon={<LuUsersRound size={32} />}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6 mx-3">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Progresso do Projeto</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full text-center text-white text-xs leading-4"
                style={{ width: `${selectedProjectData.percentage}%` }}
              >
                {selectedProjectData.percentage}%
              </div>
            </div>
          </div>

          {/* Renderização condicional para o gráfico */}
          {loadingChart ? (
             <div className="text-center p-8 bg-white rounded-lg shadow-md mx-3">Carregando dados do gráfico...</div>
          ) : (
             <ProductivityChart data={burndownData} />
          )}
        </>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-md mx-3">
          <p>Selecione um projeto para visualizar os detalhes.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;