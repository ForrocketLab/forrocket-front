import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import { TabItem } from '../../manager/collaborators/components/TabNavigation';
import EvaluationsForm from '../../../components/EvaluationForm';
import CollaboratorEvaluationHeader from '../../manager/collaborators/components/CollaboratorEvaluationHeader';

export interface ManagerCriterionState {
  score: number;
  justification: string;
}

const TABS: TabItem[] = [
  { id: 'evaluation', label: 'Avaliação' },
  { id: 'history', label: 'Histórico' },
  { id: 'customer', label: 'Avaliação do Cliente' },
];

const MenteeEvaluationDetails = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useGlobalToast();
  const [activeTab, setActiveTab] = useState('evaluation');

  useEffect(() => {}, [collaboratorIdFromUrl]);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <CollaboratorEvaluationHeader
        isAssessmentSubmitted={false}
        collaboratorName={'Lucas Daniel'}
        collaboratorInitials={'Lucas Daniel'
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)}
        collaboratorJobTitle={'sla Essa Porra'}
        onSubmit={() => {
          console.log('print');
        }}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className='px-6 p-4 md:p-8'>
        {/* {activeTab === 'evaluation' && <h1>TESTe CRITERIOS</h1>}
        {activeTab === 'history' && performanceHistory && (
          <ManagerEvaluationsHistory performanceHistory={performanceHistory} />
        )}
        {activeTab === 'customer' && collaboratorIdFromUrl && performanceHistory && (
          <ClientEvaluation collaboratorId={collaboratorIdFromUrl} performanceHistory={performanceHistory} />
        )} */}

        {activeTab === 'evaluation' && <EvaluationsForm />}
        {activeTab === 'history' && <h1>TESTe CRITERIOS</h1>}
        {activeTab === 'customer' && <h1>TESTe CRITERIOS</h1>}
      </main>
    </div>
  );
};

export default MenteeEvaluationDetails;
