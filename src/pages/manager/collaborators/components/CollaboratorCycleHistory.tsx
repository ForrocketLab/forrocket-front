import CycleEvaluationCard from './CycleEvaluationCard';

interface CollaboratorCycleHistoryProps {
  performanceHistory: PerformanceDataDto[];
}

const CollaboratorCycleHistory = ({ performanceHistory }: CollaboratorCycleHistoryProps) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full mb-6'>
      <h2 className='text-lg font-semibold text-gray-900 mb-2 sm:mb-6'>Ciclos de avaliação</h2>

      <div>
        {performanceHistory.map(performance => (
          <CycleEvaluationCard key={performance.cycle} {...performance} />
        ))}
      </div>
    </div>
  );
};

export default CollaboratorCycleHistory;
