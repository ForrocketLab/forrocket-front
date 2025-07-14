import { type FC, useEffect, useState } from 'react';
import MentorService from '../../../services/MentorService';
import { useAuth } from '../../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import MenteesTableWithPagination from '../../../components/tables/MenteesTableWithPagination';

const MentorMentees: FC = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<DashboardSubordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentorMentees = async () => {
      if (!user || user.roles.length === 0) {
        setError('Usuário não autenticado ou papéis não disponíveis.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const activeCycle = await MentorService.getActiveCycle();
        if (!activeCycle || activeCycle.status !== 'OPEN') {
          setError('Nenhum ciclo de avaliação ativo encontrado ou o ciclo não está aberto.');
          setIsLoading(false);
          return;
        }
        const dashboardData = await MentorService.getMentorDashboard(activeCycle.name);

        // Adaptar mentorados para o formato esperado pela tabela
        const adaptedMentees: DashboardSubordinate[] = dashboardData.mentoredCollaborators.map(mentee => {
          // Mapear status do mentor para o formato esperado pela tabela
          let assessmentStatus: 'PENDING' | 'DRAFT' | 'SUBMITTED';
          switch (mentee.mentorAssessmentStatus) {
            case 'PENDING':
              assessmentStatus = 'PENDING';
              break;
            case 'DRAFT':
              assessmentStatus = 'DRAFT';
              break;
            case 'SUBMITTED':
              assessmentStatus = 'SUBMITTED';
              break;
            default:
              assessmentStatus = 'PENDING';
          }

          return {
            id: mentee.collaboratorId,
            name: mentee.collaboratorName,
            initials: mentee.initials,
            jobTitle: mentee.jobTitle,
            assessmentStatus,
            selfAssessmentScore: mentee.selfAssessmentAverage,
            managerScore: mentee.managerAssessmentAverage,
          };
        });

        setMentees(adaptedMentees);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar mentorados.');
      } finally {
        setIsLoading(false);
      }
    };

    // Busca os dados na carga inicial
    fetchMentorMentees();

    // Adiciona um "ouvinte" que busca os dados sempre que a janela ganha foco
    window.addEventListener('focus', fetchMentorMentees);

    // Remove o "ouvinte" quando o componente é desmontado
    return () => {
      window.removeEventListener('focus', fetchMentorMentees);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]'></div>
        <p className='ml-4 text-gray-700'>Carregando mentorados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar dados</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors'
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Meus Mentorados</h1>
          <p className='text-gray-600 mt-2'>Gerencie e acompanhe o progresso dos colaboradores sob sua mentoria</p>
        </div>

        {/* Stats Cards
        // <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        //   <div className='bg-white p-6 rounded-lg shadow-sm border'>
        //     <div className='flex items-center'>
        //       <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
        //         <span className='text-blue-600 font-semibold text-lg'>{mentees.length}</span>
        //       </div>
        //       <div className='ml-4'>
        //         <h3 className='text-sm font-medium text-gray-500'>Total de Mentorados</h3>
        //         <p className='text-lg font-semibold text-gray-900'>
        //           {mentees.length === 1 ? '1 colaborador' : `${mentees.length} colaboradores`}
        //         </p>
        //       </div>
        //     </div>
        //   </div>

        //   <div className='bg-white p-6 rounded-lg shadow-sm border'>
        //     <div className='flex items-center'>
        //       <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
        //         <span className='text-green-600 font-semibold text-lg'>
        //           {mentees.filter(m => m.assessmentStatus === 'SUBMITTED').length}
        //         </span>
        //       </div>
        //       <div className='ml-4'>
        //         <h3 className='text-sm font-medium text-gray-500'>Avaliações Concluídas</h3>
        //         <p className='text-lg font-semibold text-gray-900'>
        //           {mentees.filter(m => m.assessmentStatus === 'SUBMITTED').length} de {mentees.length}
        //         </p>
        //       </div>
        //     </div>
        //   </div>

        //   <div className='bg-white p-6 rounded-lg shadow-sm border'>
        //     <div className='flex items-center'>
        //       <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
        //         <span className='text-yellow-600 font-semibold text-lg'>
        //           {mentees.filter(m => m.assessmentStatus === 'PENDING').length}
        //         </span>
        //       </div>
        //       <div className='ml-4'>
        //         <h3 className='text-sm font-medium text-gray-500'>Pendentes</h3>
        //         <p className='text-lg font-semibold text-gray-900'>
        //           {mentees.filter(m => m.assessmentStatus === 'PENDING').length} avaliações
        //         </p>
        //       </div>
        //     </div>
        //   </div>
        // </div> */}

        {/* Tabela de mentorados */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>Lista de Mentorados</h2>
            <p className='text-sm text-gray-500 mt-1'>Visualize e gerencie todos os colaboradores sob sua mentoria</p>
          </div>
          <div className='p-6'>
            {mentees.length > 0 ? (
              <MenteesTableWithPagination mentees={mentees} />
            ) : (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-gray-400 text-xl'>👥</span>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Nenhum mentorado encontrado</h3>
                <p className='text-gray-500'>Você ainda não possui colaboradores sob sua mentoria no ciclo atual.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorMentees;
