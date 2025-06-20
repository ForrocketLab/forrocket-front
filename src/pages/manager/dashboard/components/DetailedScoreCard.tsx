import { type ReactNode } from 'react';
import BaseCard from './BaseCard';

export interface DetailedScoreCardProps {
  title: string;
  description: string;
  score: number | string;
  ratingText: string;
  color: string;
  icon: ReactNode;
}

const DetailedScoreCard = ({ title, description, score, ratingText, color, icon }: DetailedScoreCardProps) => {
  return (
    <BaseCard
      title={title}
      leftContent={
        <div className='flex items-start'>
          <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: color }}></div>
          <p className='text-[10px] text-gray-600 font-normal'>{description}</p>
        </div>
      }
      rightContent={
        <div className='flex items-center justify-end gap-3'>
          <div style={{ color: color }}>{icon}</div>
          <div className='flex flex-col text-right'>
            <span className='text-2xl font-bold' style={{ color: color }}>
              {score}
            </span>
            <span className='text-sm font-medium' style={{ color: color }}>
              {ratingText}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default DetailedScoreCard;
