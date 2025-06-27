import ScoreProgressBar from './ScoreProgressBar';
import SummaryBox from './SummaryBox';

const CycleEvaluationCard = ({ cycle, selfScore, managerScore, finalScore }: PerformanceDataDto) => {
  const isComplete =
    finalScore !== null &&
    managerScore?.EXECUTION !== null &&
    managerScore?.BEHAVIOR !== null &&
    selfScore?.EXECUTION !== null &&
    selfScore?.BEHAVIOR !== null;

  const status = isComplete ? 'Concluído' : 'Em andamento';

  const selfScoreAverage =
    selfScore?.BEHAVIOR && selfScore?.EXECUTION ? (selfScore.BEHAVIOR + selfScore.EXECUTION) / 2 : null;

  return (
    // Container principal de um ciclo
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full mb-6'>
      {/* Cabeçalho do Ciclo */}
      <div className='flex justify-between items-center mb-4 pb-4 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h3 className='text-lg font-bold text-gray-800'>{cycle}</h3>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Nota</span>
          <div className='flex items-center justify-center w-12 h-7 bg-[#E6E6E6] text-black font-bold text-sm rounded-md'>
            {finalScore ?? '-'}
          </div>
        </div>
      </div>

      {/* Grid responsivo para as 3 barras de progresso */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <ScoreProgressBar
          title='Autoavaliação'
          score={selfScoreAverage}
          color='#24A19F' // Teal
        />
        <ScoreProgressBar
          title='Avaliação final - Execução'
          score={managerScore.EXECUTION}
          color='#419958' // Verde
        />
        <ScoreProgressBar
          title='Avaliação final - Postura'
          score={managerScore.BEHAVIOR}
          color='#F5B030' // Laranja/Amarelo
        />
      </div>
      <div className='py-8'>
        <SummaryBox title='Resumo' summaryText='Você se saiu muito bem por conta disso e isso.' />
      </div>
    </div>
  );
};

export default CycleEvaluationCard;
