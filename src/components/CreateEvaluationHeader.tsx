import { IoSend } from 'react-icons/io5';
import TabNavigation, { TabItem } from '../pages/manager/collaborators/components/TabNavigation';

interface EvaluationHeaderProps {
  isAssessmentSubmitted: boolean;
  currentCycle: string;
  onSubmit: () => void;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isComplete?: boolean;
}

const CreateEvaluationHeader = ({
  isAssessmentSubmitted,
  currentCycle,
  onSubmit,
  tabs,
  activeTab,
  onTabChange,
  isComplete = false,
}: EvaluationHeaderProps) => {
  return (
    <header className='bg-white shadow-sm'>
      {/* Barra Superior */}
      <div className='h-16 w-full flex items-center justify-between px-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <h1 className='text-lg font-semibold text-gray-900'>Ciclo {currentCycle}</h1>
        </div>
        <div className='flex items-center gap-4'>
          {!isAssessmentSubmitted && (
            <button
              onClick={onSubmit}
              disabled={!isComplete}
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                isComplete
                  ? 'bg-[#08605F] hover:bg-teal-700 text-white hover:cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isComplete ? 'Enviar todas as avaliações' : 'Complete todas as avaliações para enviar'}
            >
              Concluir
              <IoSend className='inline-block ml-4' />
            </button>
          )}
        </div>
      </div>

      {/* Navegação por Abas */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </header>
  );
};

export default CreateEvaluationHeader;
