import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import BaseCard from './BaseCard'; // Certifique-se de que o caminho para BaseCard está correto

interface DetailedEvaluationsCardProps {
  title: string;
  description: string;
  percentage: number;
  progressCircleSize?: number;
}

// Função para interpolar cores RGB
const interpolateColor = (color1Rgb: number[], color2Rgb: number[], percentage: number): string => {
  const r = Math.round(color1Rgb[0] + (color2Rgb[0] - color1Rgb[0]) * (percentage / 100));
  const g = Math.round(color1Rgb[1] + (color2Rgb[1] - color1Rgb[1]) * (percentage / 100));
  const b = Math.round(color1Rgb[2] + (color2Rgb[2] - color1Rgb[2]) * (percentage / 100));
  return `rgb(${r}, ${g}, ${b})`;
};

const DetailedEvaluationsCard = ({
  title,
  description,
  percentage,
  progressCircleSize,
}: DetailedEvaluationsCardProps) => {
  // Cores de início e fim em formato RGB
  const startColorRgb = [218, 165, 32]; // Goldenrod (#DAA520)
  const endColorRgb = [8, 96, 95]; // Seu verde (#08605F)

  // Calcula a cor dinâmica com base na porcentagem
  const dynamicProgressBarColor = interpolateColor(startColorRgb, endColorRgb, percentage);

  const circleSize = progressCircleSize || 80;

  return (
    <BaseCard
      title={title}
      leftContent={
        <div className='flex items-start'>
          {/* Usa a cor dinâmica para a barra lateral também */}
          <div
            className='w-1 self-stretch rounded-full mr-3'
            style={{ backgroundColor: dynamicProgressBarColor }}
          ></div>
          <p className='text-sm text-gray-600 font-normal'>{description}</p>
        </div>
      }
      rightContent={
        <div style={{ width: circleSize, height: circleSize }}>
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            strokeWidth={10}
            styles={buildStyles({
              // Usa a cor dinâmica para o preenchimento e o texto
              pathColor: dynamicProgressBarColor,
              textColor: dynamicProgressBarColor,
              trailColor: '#d6d6d6', // Cor de fundo da trilha
              textSize: '24px',
            })}
          />
        </div>
      }
    />
  );
};

export default DetailedEvaluationsCard;
