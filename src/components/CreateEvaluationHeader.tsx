import TabNavigation, { TabItem } from '../pages/manager/collaborators/components/TabNavigation';

interface EvaluationHeaderProps {
  isAssessmentSubmitted: boolean;
  currentCycle: string;
  onSubmit: () => void;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CreateEvaluationHeader = ({
  isAssessmentSubmitted,
  currentCycle,
  onSubmit,
  tabs,
  activeTab,
  onTabChange,
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
              className='bg-[#08605F] hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors hover:cursor-pointer'
            >
              Concluir e enviar
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
