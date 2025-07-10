import { FaStar } from 'react-icons/fa';
import BaseCard from './BaseCard';

export interface DetailedScoreCardProps {
  title: string;
  description: string;
  score: number | null;
}

interface ScoreConfig {
  color: string;
  text: string;
}

const getScoreConfig = (score: number | null): ScoreConfig => {
  if (score === null) {
    return {
      color: '#6B7280', // Cinza no tom do verde
      text: '-',
    };
  }

  if (score === 5) {
    return {
      color: '#2563EB', // Azul no tom do verde
      text: 'Perfeito',
    };
  }

  if (score >= 4) {
    return {
      color: '#419958', // Verde original
      text: 'Ótimo',
    };
  }

  if (score >= 3) {
    return {
      color: '#D97706', // Amarelo/laranja no tom do verde
      text: 'Regular',
    };
  }

  return {
    color: '#DC2626', // Vermelho no tom do verde
    text: 'Ruim',
  };
};

const DetailedScoreCard = ({ title, description, score }: DetailedScoreCardProps) => {
  const { color, text } = getScoreConfig(score);

  return (
    <BaseCard
      title={title}
      leftContent={
        <div className='flex items-start'>
          <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: color }}></div>
          <p className='text-sm text-gray-600 font-normal'>{description}</p>
        </div>
      }
      rightContent={
        <div className='flex items-center justify-end gap-3'>
          <div style={{ color: color }}>{<FaStar size={32} />}</div>
          <div className='flex flex-col text-center'>
            <span className='text-2xl font-bold' style={{ color: color }}>
              {score ?? '-'}
            </span>
            <span className='text-sm font-semibold' style={{ color: color }}>
              {text}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default DetailedScoreCard;
