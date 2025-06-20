import BaseCard from './BaseCard';
import { FaUsers } from 'react-icons/fa';

interface PendingReviewsCardProps {
  title: string;
  description: string;
  pendingCount: number;
}

const PendingReviewsCard = ({ title, description, pendingCount }: PendingReviewsCardProps) => {
  return (
    <BaseCard
      title={title}
      className='bg-[#08605F] text-white'
      leftContent={
        <div className='flex items-start'>
          <div className='w-1 self-stretch rounded-full mr-3 bg-white'></div>
          <p className='text-[10px] font-normal text-white'>{description}</p>
        </div>
      }
      rightContent={
        <div className='flex items-center justify-end gap-3'>
          <FaUsers size={32} />
          <span className='text-4xl font-bold'>{pendingCount}</span>
        </div>
      }
    />
  );
};

export default PendingReviewsCard;
