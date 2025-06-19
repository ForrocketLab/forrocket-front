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

const DetailedScoreCard = (props: DetailedScoreCardProps) => {
  return (
    <BaseCard
      // Monta todo o conteúdo da coluna esquerda aqui
      leftColumn={
        <div className='flex flex-col gap-2 h-full'>
          {/* Título */}
          <h3 className='text-[16px] font-bold text-gray-800'>{props.title}</h3>

          {/* Barra + Descrição */}
          <div className='flex items-start mt-2'>
            <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: props.color }}></div>
            <p className='text-[10px] text-gray-600 font-normal'>{props.description}</p>
          </div>
        </div>
      }
      // Monta todo o conteúdo da coluna direita aqui
      rightColumn={
        <div className='flex items-center justify-end gap-3'>
          <div style={{ color: props.color }}>{props.icon}</div>
          <div className='flex flex-col text-right'>
            <span className='text-2xl font-bold' style={{ color: props.color }}>
              {props.score}
            </span>
            <span className='text-sm font-medium' style={{ color: props.color }}>
              {props.ratingText}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default DetailedScoreCard;
