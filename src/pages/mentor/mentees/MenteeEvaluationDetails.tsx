import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TabItem } from '../../manager/collaborators/components/TabNavigation';
import CollaboratorEvaluationHeader from '../../manager/collaborators/components/CollaboratorEvaluationHeader';
import MenteeSelfAssessment from './components/MenteeSelfAssessment';
import Mentee360Assessment from './components/Mentee360Assessment';
import MenteeEvolution from './components/MenteeEvolution';
import MentorService, { MenteeDetails } from '../../../services/MentorService';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='text-center'>
            <div className='text-red-500 mb-4'>
              <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>Erro no componente</h3>
            <p className='text-gray-600 mb-4'>
              {this.state.error?.message || 'Ocorreu um erro inesperado ao carregar este componente.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

const TABS: TabItem[] = [
  { id: 'self-assessment', label: 'Autoavaliação' },
  { id: '360-assessment', label: 'Avaliação 360°' },
  { id: 'evolution', label: 'Evolução' },
];

const MenteeEvaluationDetails = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('self-assessment');
  const [menteeData, setMenteeData] = useState<MenteeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenteeData = async () => {
      if (!collaboratorIdFromUrl) return;

      try {
        setLoading(true);
        setError(null);
        const data = await MentorService.getMenteeDetails(collaboratorIdFromUrl);
        setMenteeData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do mentee:', error);
        setError('Erro ao carregar dados do mentorado');
      } finally {
        setLoading(false);
      }
    };

    fetchMenteeData();
  }, [collaboratorIdFromUrl]);

  const handleSubmitManagerAssessment = () => {
    // TODO: Implementar lógica de submissão se necessário
    console.log('Submissão de avaliação não implementada');
  };

  if (loading) {
    return (
      <div className='bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando dados do mentorado...</p>
        </div>
      </div>
    );
  }

  if (error || !menteeData) {
    return (
      <div className='bg-gray-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>
            <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>Erro ao carregar dados</h2>
          <p className='text-gray-600'>{error || 'Não foi possível carregar os dados do mentorado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <CollaboratorEvaluationHeader
        isAssessmentSubmitted={menteeData.selfAssessmentStatus === 'SUBMITTED'}
        collaboratorName={menteeData.name}
        collaboratorInitials={menteeData.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)}
        collaboratorJobTitle={menteeData.jobTitle}
        onSubmit={handleSubmitManagerAssessment}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className='px-6 p-4 md:p-8'>
        <ErrorBoundary>{activeTab === 'self-assessment' && <MenteeSelfAssessment />}</ErrorBoundary>
        <ErrorBoundary>{activeTab === '360-assessment' && <Mentee360Assessment />}</ErrorBoundary>
        <ErrorBoundary>{activeTab === 'evolution' && <MenteeEvolution />}</ErrorBoundary>
      </main>
    </div>
  );
};

export default MenteeEvaluationDetails;
