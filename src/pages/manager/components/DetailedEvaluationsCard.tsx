import BaseCard from './BaseCard';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface DetailedEvaluationsCardProps {
  title: string;
  description: string;
  percentage: number;
  progressCircleSize?: number;
}

const DetailedEvaluationsCard = ({
  title,
  description,
  percentage,
  progressCircleSize,
}: DetailedEvaluationsCardProps) => {
  const progressBarColor = '#08605F';
  const circleSize = progressCircleSize || 80;

  return (
    <BaseCard
      title={title}
      leftContent={
        <div className='flex items-start'>
          <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: progressBarColor }}></div>
          <p className='text-[10px] text-gray-600 font-normal'>{description}</p>
        </div>
      }
      rightContent={
        <div style={{ width: circleSize, height: circleSize }}>
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
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
