import { ArrowLeft } from 'lucide-react';
import TabNavigation, { type TabItem } from '../../collaboratorEvaluations/components/TabNavigation';

interface EvaluationHeaderProps {
  isAssessmentSubmitted: boolean;
  collaboratorName: string;
  collaboratorInitials: string;
  collaboratorJobTitle: string;
  onSubmit: () => void;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const EvaluationHeader = ({
  isAssessmentSubmitted,
  collaboratorName,
  collaboratorInitials,
  collaboratorJobTitle,
  onSubmit,
  tabs,
  activeTab,
  onTabChange,
}: EvaluationHeaderProps) => {
  return (
    <header className="bg-white shadow-sm mb-6">
      {/* Barra Superior */}
      <div className='h-16 w-full flex items-center justify-between px-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => window.history.back()}
            className='p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
            title='Voltar'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-lg font-semibold text-gray-900'>Avaliação de {collaboratorName}</h1>
        </div>

        <div className='flex items-center gap-4'>
          <div className='bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center font-semibold text-teal-700 text-sm'>
            {collaboratorInitials}
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-gray-900'>{collaboratorName}</span>
            <span className='text-xs text-gray-500'>{collaboratorJobTitle}</span>
          </div>
          {!isAssessmentSubmitted && (
            <button
              onClick={onSubmit}
              className='bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors'
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

export default EvaluationHeader;
