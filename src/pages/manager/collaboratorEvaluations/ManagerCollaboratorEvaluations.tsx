// src/pages/manager/collaborators/ManagerCollaboratorEvaluations.tsx

// 1. ADICIONADO: Importar o 'useParams' para ler o ID da URL
import { type FC, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Seus outros imports
import EvaluationHeader from './components/EvaluationsHeader';
import TabNavigation from './components/TabNavigation';
import SelfEvaluationReview, { type SelfEvaluationReviewRef } from './SelfEvaluationReview';

const Manager360Evaluations = () => <div className='p-8'>Conteúdo da Avaliação 360</div>;
const HistoryContent = () => <div className='p-8'>Conteúdo da Aba de Histórico</div>;

const ManagerCollaboratorEvaluationsPage: FC = () => { // Adicionado o tipo FC para consistência
  const tabs = [ { id: 'my-assessment', label: 'Avaliação' }, { id: 'assessment-360', label: 'Avaliação 360' }, { id: 'history', label: 'Histórico' } ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const selfEvaluationRef = useRef<SelfEvaluationReviewRef>(null);

  // 2. ADICIONADO: Usar o hook para obter o ID do colaborador da URL
  // Ex: na URL /manager/collaborators/3/evaluations, isto irá capturar o "3"
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>();


  const handleFinalSubmit = async () => {
    const formData = selfEvaluationRef.current?.getFormData();

    if (!formData) {
      alert('Erro ao obter os dados do formulário.');
      return;
    }
    
    // O payload agora pode usar o ID dinâmico da URL
    const payload = {
        id_avaliado: collaboratorIdFromUrl, // Usando o ID dinâmico
        id_avaliador: "2", // Exemplo: ID do gestor logado
        tipo_avaliacao: "Gestor",
        notas: Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value.score])),
        justificativa: Object.entries(formData).map(([key, value]) => `${key}: ${value.justification}`).join('\n'),
        data_avaliacao: new Date().toISOString()
    }

    console.log('Enviando para a API:', payload);
    alert('Submissão enviada! Verifique a consola para ver os dados.');
  };

  return (
    <div className='bg-gray-100 min-h-screen'>
      <EvaluationHeader
        userName={`Colaborador ${collaboratorIdFromUrl}`} // Exemplo de uso do ID dinâmico
        userInitials={`C${collaboratorIdFromUrl}`}
        jobTitle='Product Design'
        isSubmittable={true}
        onSubmit={handleFinalSubmit}
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className='pt-6'>
        {/* 3. ALTERADO: Passamos a prop 'collaboratorId' para o componente filho */}
        {activeTab === 'my-assessment' && (
            <SelfEvaluationReview 
                ref={selfEvaluationRef}
                collaboratorId={collaboratorIdFromUrl!} // O '!' assume que o ID sempre existirá nesta página
            />
        )}
        
        {activeTab === 'assessment-360' && <Manager360Evaluations />}
        {activeTab === 'history' && <HistoryContent />}
      </main>
    </div>
  );
};

export default ManagerCollaboratorEvaluationsPage;