interface ScoreProgressBarProps {
  title: string;
  score: number | null;
  maxScore?: number;
  color: string; // Cor em hexadecimal para a barra e a linha
}

const ScoreProgressBar = ({ title, score, maxScore = 5, color }: ScoreProgressBarProps) => {
  // Calcula a porcentagem para a largura da barra de progresso
  const percentage = score ? (score / maxScore) * 100 : 0;

  return (
    <div className='flex flex-col w-full gap-2'>
      {/* Stack 1: Título e Nota */}
      <div className='flex justify-between items-center'>
        <h4 className='text-sm font-medium text-gray-600'>{title}</h4>
        <span className='text-sm font-bold text-gray-800'>{score?.toFixed(1) ?? '-'}</span>
      </div>

      {/* Stack 2: Barra de Progresso */}
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='h-2 rounded-full transition-all duration-500'
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreProgressBar;
