import TabNavigation, { TabItem } from '../pages/manager/collaborators/components/TabNavigation';

interface CompletionStatus {
  selfAssessment: boolean;
  evaluation360: boolean;
  mentoring: boolean;
  references: boolean;
}

interface EvaluationHeaderProps {
  isAssessmentSubmitted: boolean;
  currentCycle: string;
  onSubmit: () => void;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isComplete?: boolean;
  completionStatus?: CompletionStatus;
}

const CreateEvaluationHeader = ({
  isAssessmentSubmitted,
  currentCycle,
  onSubmit,
  tabs,
  activeTab,
  onTabChange,
  isComplete = false,
  completionStatus,
}: EvaluationHeaderProps) => {
  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  return (
    <header className='bg-white shadow-sm'>
      {/* Barra Superior */}
      <div className='h-16 w-full flex items-center justify-between px-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <h1 className='text-lg font-semibold text-gray-900'>Ciclo {currentCycle}</h1>
          {completionStatus && (
            <div className='flex items-center gap-4 text-sm'>
              <span className={`${getStatusColor(completionStatus.selfAssessment)}`}>
                {getStatusIcon(completionStatus.selfAssessment)} Autoavaliação
              </span>
              <span className={`${getStatusColor(completionStatus.evaluation360)}`}>
                {getStatusIcon(completionStatus.evaluation360)} 360°
              </span>
              <span className={`${getStatusColor(completionStatus.mentoring)}`}>
                {getStatusIcon(completionStatus.mentoring)} Mentoring
              </span>
              <span className={`${getStatusColor(completionStatus.references)}`}>
                {getStatusIcon(completionStatus.references)} Referências
              </span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-4'>
          {!isAssessmentSubmitted && (
            <button
              onClick={onSubmit}
              disabled={!isComplete}
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors hover:cursor-pointer ${
                isComplete
                  ? 'bg-[#08605F] hover:bg-teal-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isComplete ? 'Enviar todas as avaliações' : 'Complete todas as avaliações para enviar'}
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
