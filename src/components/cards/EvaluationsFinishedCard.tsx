import { LuFilePenLine } from 'react-icons/lu';
import BaseCard from './BaseCard';

export interface EvaluationsFinishedCardProps {
  title: string;
  description: string;
  count: number;
}

const EvaluationsFinishedCard = ({ title, description, count }: EvaluationsFinishedCardProps) => {
  const color = '#08605F'; // Verde fixo

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
          <div style={{ color: color }}>
            <LuFilePenLine size={44} />
          </div>
          <div className='flex flex-col text-right'>
            <span className='text-2xl font-bold' style={{ color: color }}>
              {count}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default EvaluationsFinishedCard;
