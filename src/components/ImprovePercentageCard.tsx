import { FaSortAmountUp, FaEquals } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { ReactElement } from 'react';

export interface ImprovePercentageCardProps {
  title: string;
  description: string;
  percentage: number | null;
}

interface PercentageConfig {
  color: string;
  icon: ReactElement;
  displayValue: string;
}

const getPercentageConfig = (percentage: number | null): PercentageConfig => {
  if (percentage === null || percentage === 0) {
    return {
      color: '#08605F', // Verde
      icon: <FaEquals size={44} />,
      displayValue: percentage === null ? 'N/A' : '0.0',
    };
  }

  if (percentage > 0) {
    return {
      color: '#F5AA30', // Amarelo
      icon: <FaSortAmountUp size={44} />,
      displayValue: `+${percentage.toFixed(1)}`,
    };
  }

  return {
    color: '#DC2626', // Vermelho
    icon: <FaSortAmountUp size={44} />,
    displayValue: percentage.toFixed(1),
  };
};

const ImprovePercentageCard = ({ title, description, percentage }: ImprovePercentageCardProps) => {
  const { color, icon, displayValue } = getPercentageConfig(percentage);

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
          <div style={{ color: color }}>{icon}</div>
          <div className='flex flex-col text-right'>
            <span className='text-2xl font-bold' style={{ color: color }}>
              {displayValue}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default ImprovePercentageCard;
