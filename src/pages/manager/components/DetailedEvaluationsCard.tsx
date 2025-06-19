import BaseCard from './BaseCard'; // Importe o componente base
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface DetailedEvaluationsCardProps {
  title: string;
  description: string;
  percentage: number;
  progressCircleSize?: number; // Opcional para customizar o tamanho
}

const DetailedEvaluationsCard = (props: DetailedEvaluationsCardProps) => {
  const progressBarColor = '#08605F';
  const circleSize = props.progressCircleSize || 80; // Tamanho padrão de 80px

  return (
    <BaseCard
      // Conteúdo da Coluna Esquerda: Título + Descrição com barra
      leftColumn={
        <div className='flex flex-col gap-2 h-full'>
          <h3 className='text-[16px] font-bold text-gray-800'>{props.title}</h3>
          <div className='flex items-start mt-2'>
            <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: progressBarColor }}></div>
            <p className='text-[10px] text-gray-600 font-normal'>{props.description}</p>
          </div>
        </div>
      }
      // Conteúdo da Coluna Direita: O gráfico circular
      rightColumn={
        <div style={{ width: circleSize, height: circleSize }}>
          <CircularProgressbar
            value={props.percentage}
            text={`${props.percentage}%`}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: progressBarColor,
              textColor: progressBarColor,
              trailColor: '#d6d6d6',
              textSize: '24px',
            })}
          />
        </div>
      }
    />
  );
};

export default DetailedEvaluationsCard;
