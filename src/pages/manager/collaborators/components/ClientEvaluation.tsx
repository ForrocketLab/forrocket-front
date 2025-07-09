import { type FC, useState, useEffect } from 'react';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import ManagerService, { type Project, type ClientEvaluation as ClientEvaluationData } from '../../../../services/ManagerService';
import ClientProjectComparisonChart from './ClientProjectComparisonChart';

interface ClientEvaluationProps {
  collaboratorId: string;
  performanceHistory: PerformanceHistoryDto;
}

const ClientEvaluation: FC<ClientEvaluationProps> = ({ collaboratorId, performanceHistory }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [clientEvaluations, setClientEvaluations] = useState<ClientEvaluationData[]>([]);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!collaboratorId) return;

      setIsLoading(true);
      setError(null);
      try {
        // Busca os projetos reais do colaborador usando o serviço e o endpoint da API
        const collaboratorProjects = await ManagerService.getCollaboratorProjects(collaboratorId);

        // --- PONTO DE DEBUG ---
        // Vamos verificar o que a API está realmente retornando.
        console.log('Projetos recebidos da API para o colaborador', collaboratorId, ':', collaboratorProjects);

        setProjects(collaboratorProjects);
        // Define o primeiro projeto da lista como selecionado por padrão
        if (collaboratorProjects.length > 0) {
          setSelectedProject(collaboratorProjects[0].projectId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar os projetos do colaborador.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchProjects();
  }, [collaboratorId]);

  useEffect(() => {
    if (!selectedProject) {
      setClientEvaluations([]); // Limpa as avaliações se nenhum projeto for selecionado
      return;
    }

    const fetchClientEvaluations = async () => {
      setIsLoadingEvaluations(true);
      setEvaluationError(null);
      try {
        const evaluations = await ManagerService.getClientProjectEvaluations(selectedProject);
        setClientEvaluations(evaluations);
      } catch (err) {
        setEvaluationError(err instanceof Error ? err.message : 'Falha ao carregar avaliações do cliente.');
        console.error(err);
      } finally {
        setIsLoadingEvaluations(false);
      }
    };

    fetchClientEvaluations();
  }, [selectedProject]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProject(event.target.value);
  };

  if (isLoading) {
    return <div className='flex justify-center items-center h-64'><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className='p-8 text-center text-red-500'>Erro: {error}</div>;
  }

  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg font-semibold text-gray-900'>Avaliação do Cliente por Projeto</h2>
        {projects.length > 0 && (
          <div className='flex items-center gap-2'>
            <label htmlFor='project-select' className='text-sm font-medium text-gray-700'>Selecione o Projeto:</label>
            <select id='project-select' value={selectedProject} onChange={handleProjectChange} className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'>
              {projects.map(project => (<option key={project.projectId} value={project.projectId}>{project.projectName}</option>))}
            </select>
          </div>
        )}
      </div>

      {projects.length === 0 && !isLoading ? (
        <p className='text-gray-600'>Este colaborador não está associado a nenhum projeto com avaliação de cliente.</p>
      ) : (
        <>
          {isLoadingEvaluations ? (
            <div className='flex justify-center items-center h-64'><LoadingSpinner /></div>
          ) : evaluationError ? (
            <div className='p-8 text-center text-red-500'>Erro: {evaluationError}</div>
          ) : (
            <>
              <ClientProjectComparisonChart 
                performanceHistory={performanceHistory.performanceData} 
                clientEvaluations={clientEvaluations} 
              />

              {/* Seção de Feedback do Cliente */}
              <div className='mt-8 pt-6 border-t border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Feedback do Cliente</h3>
                {clientEvaluations.length > 0 ? (
                  <div className='space-y-4'>
                    {clientEvaluations.map((evaluation, index) => (
                      <div key={index} className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='font-semibold text-gray-700'>Ciclo: {evaluation.cycle}</span>
                          <span className='text-sm font-bold text-blue-600'>Nota: {evaluation.score}</span>
                        </div>
                        <p className='text-gray-600 italic'>"{evaluation.justification}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500'>Nenhum feedback de cliente encontrado para este projeto.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ClientEvaluation;
