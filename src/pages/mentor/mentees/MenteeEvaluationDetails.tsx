import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MentorService, {
  MenteePerformanceMetrics,
  MenteeSelfAssessment,
  MenteeAssessment360,
} from '../../../services/MentorService';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface MenteeData {
  assessments?: MenteeAssessment360[];
  performanceMetrics?: MenteePerformanceMetrics;
  selfAssessment?: MenteeSelfAssessment;
  cycle?: string;
}

const MenteeEvaluationDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menteeData, setMenteeData] = useState<MenteeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenteeDetails = async () => {
      if (!id) {
        setError('ID do mentorado não fornecido.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados do mentorado (você pode adaptar conforme necessário)
        const activeCycle = await MentorService.getActiveCycle();
        const [assessments, performanceMetrics, selfAssessment] = await Promise.all([
          MentorService.getMentee360Assessments(id, activeCycle.name),
          MentorService.getMenteePerformanceMetrics(id, activeCycle.name),
          MentorService.getMenteeSelfAssessment(id, activeCycle.name).catch(() => null),
        ]);

        setMenteeData({
          assessments,
          performanceMetrics,
          selfAssessment: selfAssessment || undefined,
          cycle: activeCycle.name,
        });
      } catch (err) {
        console.error('Erro ao buscar detalhes do mentorado:', err);
        setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes do mentorado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenteeDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate('/mentor/mentees');
  };

  if (isLoading) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]'></div>
        <p className='ml-4 text-gray-700'>Carregando detalhes do mentorado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Erro ao carregar detalhes</h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <div className='space-x-4'>
            <button
              onClick={() => window.location.reload()}
              className='bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064b4c] transition-colors'
            >
              Tentar novamente
            </button>
            <button
              onClick={handleGoBack}
              className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <button
            onClick={handleGoBack}
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <ArrowLeft size={20} className='mr-2' />
            Voltar para Mentorados
          </button>
          <h1 className='text-2xl font-bold text-gray-900'>Detalhes do Mentorado</h1>
          <p className='text-gray-600 mt-2'>
            Visualize informações detalhadas sobre o progresso e avaliações do mentorado
          </p>
        </div>

        {/* Content Sections */}
        <div className='space-y-6'>
          {/* Performance Metrics */}
          {menteeData?.performanceMetrics && (
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>Métricas de Performance</h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-blue-900'>Score Final</h3>
                  <p className='text-2xl font-bold text-blue-600'>
                    {menteeData.performanceMetrics.finalScore?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-green-900'>Avaliação 360°</h3>
                  <p className='text-2xl font-bold text-green-600'>
                    {menteeData.performanceMetrics.assessment360Average?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className='bg-purple-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-purple-900'>Mentoria</h3>
                  <p className='text-2xl font-bold text-purple-600'>
                    {menteeData.performanceMetrics.mentoringScore?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 360 Assessments */}
          {menteeData?.assessments && menteeData.assessments.length > 0 && (
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>Avaliações 360°</h2>
              <div className='space-y-4'>
                {menteeData.assessments.map((assessment: MenteeAssessment360, index: number) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <h3 className='font-medium text-gray-900'>{assessment.evaluatorName}</h3>
                        <p className='text-sm text-gray-500'>{assessment.evaluatorJobTitle}</p>
                      </div>
                      <div className='text-right'>
                        <span className='text-lg font-bold text-[#085F60]'>
                          {assessment.overallScore?.toFixed(1) || 'N/A'}
                        </span>
                        <p className='text-xs text-gray-500'>Score</p>
                      </div>
                    </div>
                    {assessment.strengths && (
                      <div className='mb-3'>
                        <h4 className='text-sm font-medium text-gray-700 mb-1'>Pontos Fortes:</h4>
                        <p className='text-sm text-gray-600'>{assessment.strengths}</p>
                      </div>
                    )}
                    {assessment.improvements && (
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-1'>Pontos de Melhoria:</h4>
                        <p className='text-sm text-gray-600'>{assessment.improvements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self Assessment */}
          {menteeData?.selfAssessment && (
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>Autoavaliação</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium text-gray-700 mb-2'>Score Médio da Autoavaliação</h3>
                  <p className='text-2xl font-bold text-[#085F60]'>
                    {menteeData.selfAssessment.averageScore?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className='font-medium text-gray-700 mb-2'>Status</h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      menteeData.selfAssessment.status === 'SUBMITTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {menteeData.selfAssessment.status === 'SUBMITTED' ? 'Enviada' : 'Rascunho'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cycle Information */}
          <div className='bg-white rounded-lg shadow-sm border p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Informações do Ciclo</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h3 className='font-medium text-gray-700'>Ciclo Atual</h3>
                <p className='text-gray-600'>{menteeData?.cycle || 'N/A'}</p>
              </div>
              <div>
                <h3 className='font-medium text-gray-700'>Status</h3>
                <span className='inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeEvaluationDetails;
