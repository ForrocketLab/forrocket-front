import BaseCard from './BaseCard';
import { FaUsers } from 'react-icons/fa';

interface PendingReviewsCardProps {
  title: string;
  pendingCount: number;
}

const PendingReviewsCard = ({ title, pendingCount }: PendingReviewsCardProps) => {
  const isZeroPending = pendingCount === 0;

  const description = isZeroPending ? 'Você concluiu suas revisões de notas' : 'Conclua suas revisões de notas';

  const cardBackgroundColor = isZeroPending ? 'bg-white' : 'bg-[#08605F]';
  const cardTextColor = isZeroPending ? 'text-gray-800' : 'text-white';
  const descriptionColor = isZeroPending ? 'text-gray-600' : 'text-white';
  const barColor = isZeroPending ? 'bg-[#08605F]' : 'bg-white';
  const iconColor = isZeroPending ? '#08605F' : 'white';

  return (
    <BaseCard
      title={title}
      className={`${cardBackgroundColor} ${cardTextColor}`}
      leftContent={
        <div className='flex items-start'>
          <div className={`w-1 self-stretch rounded-full mr-3 ${barColor}`}></div>
          <p className={`text-sm font-normal ${descriptionColor}`}>{description}</p>
        </div>
      }
      rightContent={
        <div className='flex items-center justify-end gap-3'>
          <FaUsers size={32} style={{ color: iconColor }} />
          <span className={`text-4xl font-bold text-[${iconColor}]`}>{pendingCount}</span>
        </div>
      }
    />
  );
};

export default PendingReviewsCard;
