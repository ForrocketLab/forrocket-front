import { useState } from 'react';
import EvaluationHeader from './components/EvaluationsHeader';
import TabNavigation from './components/TabNavigation';
import SelfEvaluationReview from './SelfEvaluationReview';

const Assessment360Content = () => (
  <div className='p-8'>
    <h2>Conteúdo da Aba 360</h2>
    <p>Formulário para avaliar pares aqui...</p>
  </div>
);
const HistoryContent = () => (
  <div className='p-8'>
    <h2>Conteúdo da Aba de Histórico</h2>
    <p>Lista de avaliações passadas aqui...</p>
  </div>
);

const ManagerCollaboratorEvaluationsPage = () => {
  // Dados de configuração para as abas
  const tabs = [
    { id: 'my-assessment', label: 'Avaliação' },
    { id: 'assessment-360', label: 'Avaliação 360' },
    { id: 'history', label: 'Histórico' },
  ];

  // 1. Estado para controlar qual aba está ativa. Começa com a primeira.
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Função para ser chamada pelo componente TabNavigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className='bg-gray-100 min-h-screen'>
      <EvaluationHeader
        userName='Colaborador 1'
        userInitials='C1'
        jobTitle='Product Design'
        isSubmittable={false} // Lógica a ser implementada
        onSubmit={() => {}}
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Container de conteúdo que renderiza o componente correto */}
      <main className='pt-6'>
        {activeTab === 'my-assessment' && <SelfEvaluationReview />}
        {activeTab === 'assessment-360' && <Assessment360Content />}
        {activeTab === 'history' && <HistoryContent />}
      </main>
    </div>
  );
};

export default ManagerCollaboratorEvaluationsPage;
